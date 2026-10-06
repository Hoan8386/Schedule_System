package com.vn.schedule.domain;

import java.io.Serializable;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NotificationTemplateVariableId implements Serializable {
    private Integer notificationTemplateId;
    private Integer variableId;
}

