package com.fitrack.workout.api;

import com.fitrack.workout.api.dto.CreateWorkoutRequest;
import com.fitrack.workout.api.dto.UpdateWorkoutRequest;
import com.fitrack.workout.api.dto.WorkoutResponse;
import com.fitrack.workout.application.port.in.WorkoutUseCase;
import com.fitrack.workout.web.UserIdRequiredFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutUseCase workouts;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkoutResponse create(
            @RequestAttribute(UserIdRequiredFilter.USER_ID_REQUEST_ATTRIBUTE) String userId,
            @Valid @RequestBody CreateWorkoutRequest body
    ) {
        return workouts.create(userId, body);
    }

    @GetMapping
    public List<WorkoutResponse> list(
            @RequestAttribute(UserIdRequiredFilter.USER_ID_REQUEST_ATTRIBUTE) String userId
    ) {
        return workouts.list(userId);
    }

    @GetMapping("/{id}")
    public WorkoutResponse get(
            @RequestAttribute(UserIdRequiredFilter.USER_ID_REQUEST_ATTRIBUTE) String userId,
            @PathVariable String id
    ) {
        return workouts.get(userId, id);
    }

    @PutMapping("/{id}")
    public WorkoutResponse update(
            @RequestAttribute(UserIdRequiredFilter.USER_ID_REQUEST_ATTRIBUTE) String userId,
            @PathVariable String id,
            @Valid @RequestBody UpdateWorkoutRequest body
    ) {
        return workouts.update(userId, id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @RequestAttribute(UserIdRequiredFilter.USER_ID_REQUEST_ATTRIBUTE) String userId,
            @PathVariable String id
    ) {
        workouts.delete(userId, id);
    }
}
