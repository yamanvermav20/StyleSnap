import SwiftUI

/// A photo loaded from a URL (DESIGN.md: Remote photo). A `surfaceVariant` box while it loads, the
/// `noImage` icon if it fails. With an aspect ratio it sizes itself to the width it's offered and
/// fills that box; without one it fills whatever frame the caller gives it. Decorative to VoiceOver.
struct RemotePhoto: View {
    let url: String?
    var aspectRatio: CGFloat?

    var body: some View {
        if let aspectRatio {
            Color.clear
                .aspectRatio(aspectRatio, contentMode: .fit)
                .overlay { photo }
                .clipped()
        } else {
            Color.clear
                .overlay { photo }
                .clipped()
        }
    }

    private var photo: some View {
        AsyncImage(url: url.flatMap(URL.init(string:)), transaction: Transaction(animation: AppMotion.decelerate(AppMotion.fast))) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
            case .failure:
                AppColors.surfaceVariant
                    .overlay {
                        Image(AppIcon.noImage)
                            .resizable()
                            .scaledToFit()
                            .frame(width: AppIconSize.lg, height: AppIconSize.lg)
                            .foregroundStyle(AppColors.onSurfaceVariant)
                    }
            default:
                AppColors.surfaceVariant
            }
        }
        .accessibilityHidden(true)
    }
}

#Preview {
    HStack(spacing: AppSpacing.md) {
        RemotePhoto(url: Fixtures.outfits[0].imageUrl, aspectRatio: 3 / 4)
            .clipShape(.rect(cornerRadius: AppRadius.lg))
        RemotePhoto(url: "https://invalid.example/none.jpg", aspectRatio: 3 / 4)
            .clipShape(.rect(cornerRadius: AppRadius.lg))
    }
    .padding(AppSpacing.lg)
}
