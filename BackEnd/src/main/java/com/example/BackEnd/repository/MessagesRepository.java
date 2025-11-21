package com.example.BackEnd.repository;

import com.example.BackEnd.entity.Messages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessagesRepository extends JpaRepository<Messages, Long> {

        @Query("SELECT m FROM Messages m WHERE m.room.id = :roomId ORDER BY m.timestamp DESC")
        Page<Messages> findByRoomIdOrderByTimestampDesc(@Param("roomId") Long roomId, Pageable pageable);

        @Query("SELECT m FROM Messages m WHERE m.room.id = :roomId AND m.user.id = :userId ORDER BY m.timestamp DESC")
        Page<Messages> findByRoomIdAndUserIdOrderByTimestampDesc(@Param("roomId") Long roomId,
                        @Param("userId") Long userId,
                        Pageable pageable);

        @Query("SELECT m FROM Messages m WHERE m.room.id = :roomId AND m.contentType = :contentType ORDER BY m.timestamp DESC")
        Page<Messages> findByRoomIdAndContentTypeOrderByTimestampDesc(@Param("roomId") Long roomId,
                        @Param("contentType") Messages.ContentType contentType, Pageable pageable);

        @Query("SELECT COUNT(m) FROM Messages m WHERE m.room.id = :roomId")
        Long countByRoomId(@Param("roomId") Long roomId);

        void deleteByRoomId(Long roomId);

        void deleteByUserId(Long userId);
}