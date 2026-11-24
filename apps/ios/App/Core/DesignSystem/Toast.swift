import SwiftUI

/// A transient message (DESIGN.md: Transient message). A new one replaces the current one.
struct ToastMessage: Equatable, Identifiable {
    let id = UUID()
    let text: String
}

extension View {
    /// Shows `message` at the bottom, over the content, and clears it after a few seconds.
    func toast(_ message: Binding<ToastMessage?>) -> some View {
        modifier(ToastModifier(message: message))
    }
}

private struct ToastModifier: ViewModifier {
    @Binding var message: ToastMessage?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// How long a toast stays up.
    private static let visibleFor: Duration = .seconds(3)

    func body(content: Content) -> some View {
        content
            .overlay(alignment: .bottom) {
                if let message {
                    Text(message.text)
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.background)
                        .multilineTextAlignment(.leading)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .frame(minHeight: AppSize.touchTarget)
                        .background(AppColors.onBackground, in: .rect(cornerRadius: AppRadius.md))
                        .shadow(AppElevation.high)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.bottom, AppSpacing.lg)
                        .accessibilityIdentifier("toast")
                        .accessibilityAddTraits(.updatesFrequently)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .id(message.id)
                        .onAppear {
                            AccessibilityNotification.Announcement(message.text).post()
                        }
                }
            }
            .animation(AppMotion.reduced(AppMotion.standard(AppMotion.normal), reduceMotion), value: message)
            .task(id: message?.id) {
                guard message != nil else { return }
                try? await Task.sleep(for: Self.visibleFor)
                guard !Task.isCancelled else { return }
                message = nil
            }
    }
}

#Preview {
    Color.clear
        .toast(.constant(ToastMessage(text: Strings.saveToCollectionAdded(name: "Weekend edits"))))
}
