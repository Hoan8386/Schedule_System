package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "organization_setting")
@Getter
@Setter
@NoArgsConstructor
public class OrganizationSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "organization_setting_id")
    private Integer organizationSettingId;
    @Column(name = "organization_name", nullable = false)
    private String organizationName;
    @Column(name = "logo_file_id")
    private Integer logoFileId;
    @Column(name = "favicon_file_id")
    private Integer faviconFileId;
    @Column(name = "primary_color")
    private String primaryColor;
    @Column(name = "secondary_color")
    private String secondaryColor;
    @Column(name = "contact_email")
    private String contactEmail;
    @Column(name = "contact_phone")
    private String contactPhone;
    @Column(name = "regulations")
    private String regulations;
}

