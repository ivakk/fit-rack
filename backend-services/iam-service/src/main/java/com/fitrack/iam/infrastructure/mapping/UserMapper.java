package com.fitrack.iam.infrastructure.mapping;

import com.fitrack.iam.domain.User;
import com.fitrack.iam.infrastructure.mongo.document.UserDocument;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toDomain(UserDocument document) {
        if (document == null) {
            return null;
        }
        return User.builder()
                .id(document.getId())
                .email(document.getEmail())
                .passwordHash(document.getPasswordHash())
                .fullName(document.getFullName())
                .role(document.getRole())
                .phoneNumber(document.getPhoneNumber())
                .gender(document.getGender())
                .build();
    }

    public UserDocument toDocument(User user) {
        if (user == null) {
            return null;
        }
        return UserDocument.builder()
                .id(user.getId())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .build();
    }
}
