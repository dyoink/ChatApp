package com.example.BackEnd.repository;

import com.example.BackEnd.entity.RoomMembers;
import com.example.BackEnd.entity.RoomMembers.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMembersRepository extends JpaRepository<RoomMembers, Long> {

    @Query("SELECT rm FROM RoomMembers rm WHERE rm.room.id = :roomId AND rm.user.id = :userId")
    Optional<RoomMembers> findByRoomIdAndUserId(@Param("roomId") Long roomId, @Param("userId") Long userId);

    @Query("SELECT rm FROM RoomMembers rm WHERE rm.room.id = :roomId")
    List<RoomMembers> findByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT rm FROM RoomMembers rm WHERE rm.user.id = :userId")
    List<RoomMembers> findByUserId(@Param("userId") Long userId);

    @Query("SELECT rm FROM RoomMembers rm WHERE rm.room.id = :roomId AND rm.role = :role")
    List<RoomMembers> findByRoomIdAndRole(@Param("roomId") Long roomId, @Param("role") MemberRole role);

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    void deleteByRoomIdAndUserId(Long roomId, Long userId);
}