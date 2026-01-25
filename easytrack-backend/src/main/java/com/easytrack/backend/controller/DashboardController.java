package com.easytrack.backend.controller;

import com.easytrack.backend.dto.DashboardSummaryDTO;
import com.easytrack.backend.service.DashboardService;
import com.easytrack.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Copilot-inspired dashboard summary API")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtil securityUtil;

    @GetMapping("/summary")
    @Operation(summary = "Get comprehensive dashboard summary for authenticated user",
            description = "Returns financial overview, budget status, spending trends, and recent transactions")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        Long userId = securityUtil.getAuthenticatedUserId();
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(summary);
    }
}