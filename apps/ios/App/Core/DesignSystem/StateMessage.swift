import SwiftUI

/// A centered progress indicator for a whole screen (DESIGN.md: Loading), test ID `state.loading`.
struct LoadingState: View {
    var body: some View {
        ProgressView()
            .controlSize(.large)
            .tint(AppColors.onSurfaceVariant)
            .padding(AppSpacing.xxl)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Strings.commonLoading)
            .accessibilityIdentifier("state.loading")
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/// A centered icon, title, body and optional actions: the shared shape of the error and empty states.
struct StateMessage<Actions: View>: View {
    let icon: ImageResource
    let title: String
    var message: String?
    @ViewBuilder var actions: Actions

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Image(icon)
                .resizable()
                .scaledToFit()
                .frame(width: AppIconSize.lg, height: AppIconSize.lg)
                .foregroundStyle(AppColors.onSurfaceVariant)
                .padding(AppSpacing.lg)
                .background(AppColors.surfaceVariant, in: .circle)
                .accessibilityHidden(true)
            Text(title)
                .font(AppTypography.title)
                .foregroundStyle(AppColors.onBackground)
            if let message {
                Text(message)
                    .font(AppTypography.body)
                    .foregroundStyle(AppColors.onSurfaceVariant)
            }
            actions
                .padding(.top, AppSpacing.sm)
        }
        .multilineTextAlignment(.center)
        .padding(AppSpacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .contain)
    }
}

/// The shared error state (DESIGN.md: Error), test ID `state.error`. Without `retry` there's no
/// Try again button, as for a record that doesn't exist.
struct ErrorState: View {
    var message: String = Strings.commonErrorBody
    var retry: (() -> Void)?

    var body: some View {
        StateMessage(icon: AppIcon.offline, title: Strings.commonErrorTitle, message: message) {
            if let retry {
                Button(action: retry) {
                    Label {
                        Text(Strings.commonRetry)
                    } icon: {
                        Image(AppIcon.retry)
                            .resizable()
                            .frame(width: AppIconSize.sm, height: AppIconSize.sm)
                    }
                }
                .buttonStyle(.primary)
                .accessibilityIdentifier("state.retry")
            }
        }
        .accessibilityIdentifier("state.error")
    }
}

/// The error state for a failed load: the not found message (no retry) for a missing record,
/// otherwise the general message with Try again.
struct LoadErrorState: View {
    let error: RepositoryError
    var notFoundMessage: String?
    let retry: () -> Void

    var body: some View {
        if error == .notFound, let notFoundMessage {
            ErrorState(message: notFoundMessage)
        } else {
            ErrorState(retry: retry)
        }
    }
}

/// An empty state (DESIGN.md: Empty), test ID `state.empty`, with an optional action `state.emptyAction`.
struct EmptyState: View {
    let icon: ImageResource
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        StateMessage(icon: icon, title: title, message: message) {
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .buttonStyle(.primary)
                    .accessibilityIdentifier("state.emptyAction")
            }
        }
        .accessibilityIdentifier("state.empty")
    }
}

#Preview {
    VStack {
        LoadingState()
        ErrorState(retry: {})
        EmptyState(icon: AppIcon.collections, title: Strings.collectionsEmptyTitle, message: Strings.collectionsEmptyBody,
                   actionTitle: Strings.collectionsEmptyAction, action: {})
    }
    .background(AppColors.background)
}
