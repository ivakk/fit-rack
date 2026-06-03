package com.fitrack.iam.infrastructure.mongo.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String gender;
}
