package com.vn.schedule.dto;

import java.beans.Introspector;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Converts persistence objects to deliberately shallow response DTOs.
 *
 * <p>Relations are represented by their identifiers. This keeps controller
 * responses stable, prevents lazy-loading surprises and makes cycles (for
 * example employee - user - employee) impossible. Sensitive credential fields
 * are never copied.</p>
 */
public final class DtoMapper {
    private static final Set<String> SENSITIVE = Set.of(
            "password", "passwordHash", "refreshToken", "token", "secret");
    /** Getter đọc được của từng lớp – Introspector không cache khi có stopClass nên tự cache tại đây. */
    private static final Map<Class<?>, List<Map.Entry<String, Method>>> GETTERS = new ConcurrentHashMap<>();

    private DtoMapper() {
    }

    public static Map<String, Object> toMap(Object source) {
        return toMap(source, new HashSet<>());
    }

    public static List<Map<String, Object>> toList(Collection<?> source) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (source != null) {
            for (Object value : source) {
                result.add(toMap(value));
            }
        }
        return result;
    }

    private static Map<String, Object> toMap(Object source, Set<Object> visited) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (source == null) {
            return result;
        }
        if (isSimple(source.getClass())) {
            result.put("value", source);
            return result;
        }
        if (!visited.add(source)) {
            return result;
        }
        try {
            for (Map.Entry<String, Method> property : getters(source.getClass())) {
                String name = property.getKey();
                Method getter = property.getValue();
                Object value;
                try {
                    value = getter.invoke(source);
                } catch (ReflectiveOperationException | RuntimeException ignored) {
                    continue;
                }
                if (value == null || isSimple(value.getClass())) {
                    result.put(name, value);
                } else if (value instanceof Collection<?> collection) {
                    result.put(name, collection.stream()
                            .map(DtoMapper::relationId)
                            .toList());
                } else if (value.getClass().getPackageName().equals("com.vn.shopping.domain")) {
                    result.put(name, relationId(value));
                }
            }
        } catch (Exception ignored) {
            // A response must remain serializable even for an unusual proxy.
        }
        return result;
    }

    private static List<Map.Entry<String, Method>> getters(Class<?> type) {
        return GETTERS.computeIfAbsent(type, key -> {
            List<Map.Entry<String, Method>> getters = new ArrayList<>();
            try {
                for (var descriptor : Introspector.getBeanInfo(key, Object.class).getPropertyDescriptors()) {
                    Method getter = descriptor.getReadMethod();
                    if (SENSITIVE.contains(descriptor.getName()) || getter == null) {
                        continue;
                    }
                    try {
                        getter.setAccessible(true);
                    } catch (RuntimeException ignored) {
                        continue;
                    }
                    getters.add(Map.entry(descriptor.getName(), getter));
                }
            } catch (Exception ignored) {
                // Lớp bất thường (proxy...) thì trả về rỗng như trước.
            }
            return List.copyOf(getters);
        });
    }

    private static Object relationId(Object value) {
        try {
            Method id = value.getClass().getMethod("getId");
            return Map.of("id", id.invoke(value));
        } catch (ReflectiveOperationException ignored) {
            return Map.of();
        }
    }

    private static boolean isSimple(Class<?> type) {
        return type.isPrimitive() || type.isEnum()
                || Number.class.isAssignableFrom(type)
                || CharSequence.class.isAssignableFrom(type)
                || java.time.temporal.Temporal.class.isAssignableFrom(type)
                || java.util.Date.class.isAssignableFrom(type)
                || type.equals(Boolean.class) || type.equals(Character.class);
    }
}
