package com.example.BackEnd.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Entity
@Table(name = "rooms")
@Data
public class Rooms {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Size(min = 1, max = 100, message = "Room name must be between 1 and 100 characters")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private Users creator;

    @Column(unique = true, nullable = false, length = 6)
    @Size(min = 6, max = 6, message = "Room code must be exactly 6 characters")
    private String code;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "max_members", nullable = false)
    @Min(value = 1, message = "Max members must be at least 1")
    @Max(value = 10, message = "Max members cannot exceed 10")
    private Integer maxMembers;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<RoomMembers> roomMembers;

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Messages> messages;
}