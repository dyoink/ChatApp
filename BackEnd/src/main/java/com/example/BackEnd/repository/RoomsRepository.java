package com.example.BackEnd.repository;

import com.example.BackEnd.entity.Rooms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomsRepository extends JpaRepository<Rooms, Long> {

    Optional<Rooms> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT r FROM Rooms r WHERE r.name LIKE %:query% OR r.code LIKE %:query% OR r.creator.username LIKE %:query%")
    Page<Rooms> searchRooms(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(rm) FROM RoomMembers rm WHERE rm.room.id = :roomId")
    Long countMembersByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT r FROM Rooms r JOIN r.roomMembers rm WHERE rm.user.id = :userId")
    Page<Rooms> findRoomsByUserId(@Param("userId") Long userId, Pageable pageable);

    // Thêm method mới
    Page<Rooms> findByCreatorId(Long creatorId, Pageable pageable);
}