package com.vn.shopping.domain;

import java.io.Serializable;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RolePermissionId implements Serializable {
    private Integer roleId;
    private Integer permissionId;
}

