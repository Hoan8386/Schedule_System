package com.vn.schedule.domain;

import java.io.Serializable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NotificationTemplateVariableId implements Serializable {
    private Integer notificationTemplateId;
    private Integer variableId;

    public NotificationTemplateVariableId(Integer notificationTemplateId, Integer variableId) {
        this.notificationTemplateId = notificationTemplateId;
        this.variableId = variableId;
    }
}