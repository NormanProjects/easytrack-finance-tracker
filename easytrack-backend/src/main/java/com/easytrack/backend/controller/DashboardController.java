package com.easytrack.backend.controller;

import com.easytrack.backend.dto.DashboardSummaryDTO;
import com.easytrack.backend.service.DashboardService;
import com.easytrack.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

        System.out.println("🔍 Dashboard summary requested");

        try {
            // Check if this is a mock user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("   Authenticated user: " + auth.getName());

            // For mock/demo users, return empty dashboard data
            if ("demo@test.com".equals(auth.getName())) {
                System.out.println("   ⚠️ Mock user detected - returning empty dashboard");

                // Create empty DTO using constructor or builder
                DashboardSummaryDTO mockSummary = new DashboardSummaryDTO();

                System.out.println("   ✅ Returning mock dashboard data");
                return ResponseEntity.ok(mockSummary);
            }

            // For real users, use the normal flow
            System.out.println("   Real user - fetching from database");
            Long userId = securityUtil.getAuthenticatedUserId();
            DashboardSummaryDTO summary = dashboardService.getDashboardSummary(userId);
            System.out.println("   ✅ Dashboard data retrieved successfully");
            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            System.err.println("   ❌ Error in getDashboardSummary: " + e.getMessage());
            e.printStackTrace();

            // Return empty DTO as fallback
            System.out.println("   Returning fallback empty dashboard");
            return ResponseEntity.ok(new DashboardSummaryDTO());
        }
    }
}