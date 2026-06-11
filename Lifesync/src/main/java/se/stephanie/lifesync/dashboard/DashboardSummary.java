package se.stephanie.lifesync.dashboard;

public record DashboardSummary (
        long pendingTodos,
        long unreadNotifications,
        long unpaidPayments,
        long packagesInTransit,
        long upcomingReminders
){
}
