package com.fitrack.workout.infrastructure.crypto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class WorkoutEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int CURRENT_VERSION = 1;

    private final SecretKeySpec secretKey;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public WorkoutEncryptionService(WorkoutEncryptionProperties properties, ObjectMapper objectMapper) {
        try {
            byte[] keyBytes = MessageDigest.getInstance("SHA-256")
                    .digest(properties.getWorkoutKey().getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
            this.objectMapper = objectMapper.copy().findAndRegisterModules();
        } catch (Exception e) {
            throw new WorkoutEncryptionException("Failed to initialize workout encryption key", e);
        }
    }

    public EncryptedBlob encrypt(WorkoutPayload payload) {
        try {
            byte[] plain = objectMapper.writeValueAsBytes(payload);
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plain);

            return new EncryptedBlob(
                    CURRENT_VERSION,
                    Base64.getEncoder().encodeToString(iv),
                    Base64.getEncoder().encodeToString(cipherText)
            );
        } catch (Exception e) {
            throw new WorkoutEncryptionException("Failed to encrypt workout payload", e);
        }
    }

    public WorkoutPayload decrypt(EncryptedBlob blob) {
        try {
            byte[] iv = Base64.getDecoder().decode(blob.ivBase64());
            byte[] cipherText = Base64.getDecoder().decode(blob.ciphertextBase64());

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] plain = cipher.doFinal(cipherText);

            return objectMapper.readValue(plain, WorkoutPayload.class);
        } catch (Exception e) {
            throw new WorkoutEncryptionException("Failed to decrypt workout payload", e);
        }
    }

    public record EncryptedBlob(int version, String ivBase64, String ciphertextBase64) {
    }
}
