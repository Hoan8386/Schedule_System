package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_template_variable")
@IdClass(NotificationTemplateVariableId.class)
@Getter
@Setter
@NoArgsConstructor
public class NotificationTemplateVariable {
    @Id
    @Column(name = "notification_template_id", nullable = false)
    private Integer notificationTemplateId;
    @Id
    @Column(name = "variable_id", nullable = false)
    private Integer variableId;
}

