package com.vn.schedule.domain;

import java.io.Serializable;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserRoleId implements Serializable {
    private Integer userId;
    private Integer roleId;
}

