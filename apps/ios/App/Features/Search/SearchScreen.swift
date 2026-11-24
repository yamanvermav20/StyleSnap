import SwiftUI

/// Search outfits by text, filter and sort them (spec/features/search.md).
struct SearchScreen: View {
    @State private var viewModel: SearchViewModel

    init(viewModel: SearchViewModel) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                filters
                results
            }
            .padding(.bottom, AppSpacing.xxl)
        }
        .scrollDismissesKeyboard(.immediately)
        .background(AppColors.background)
        .navigationTitle(Strings.searchTitle)
        .searchable(text: $viewModel.text, placement: .navigationBarDrawer(displayMode: .always), prompt: Text(Strings.searchPlaceholder))
        .onChange(of: viewModel.text) { viewModel.textChanged() }
        .task { await viewModel.loadIfNeeded() }
    }

    // MARK: Filters

    private var filters: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppSpacing.sm) {
                Menu {
                    Picker(Strings.searchCategory, selection: Binding(get: { viewModel.categoryId }, set: { viewModel.setCategory($0) })) {
                        Text(Strings.searchAny).tag(String?.none)
                        ForEach(viewModel.categories) { category in
                            Text(category.name).tag(Optional(category.id))
                        }
                    }
                    .pickerStyle(.inline)
                } label: {
                    ChipLabel(title: viewModel.categoryLabel, isOn: viewModel.categoryId != nil, opensMenu: true)
                }
                .accessibilityIdentifier("search.filter.category")

                Menu {
                    Picker(Strings.searchSeason, selection: Binding(get: { viewModel.season }, set: { viewModel.setSeason($0) })) {
                        Text(Strings.searchAny).tag(Season?.none)
                        ForEach(Season.allCases) { season in
                            Text(season.label).tag(Optional(season))
                        }
                    }
                    .pickerStyle(.inline)
                } label: {
                    ChipLabel(title: viewModel.seasonLabel, isOn: viewModel.season != nil, opensMenu: true)
                }
                .accessibilityIdentifier("search.filter.season")

                Menu {
                    Picker(Strings.searchOccasion, selection: Binding(get: { viewModel.occasion }, set: { viewModel.setOccasion($0) })) {
                        Text(Strings.searchAny).tag(Occasion?.none)
                        ForEach(Occasion.allCases) { occasion in
                            Text(occasion.label).tag(Optional(occasion))
                        }
                    }
                    .pickerStyle(.inline)
                } label: {
                    ChipLabel(title: viewModel.occasionLabel, isOn: viewModel.occasion != nil, opensMenu: true)
                }
                .accessibilityIdentifier("search.filter.occasion")

                Menu {
                    Picker(Strings.searchSort, selection: Binding(get: { viewModel.sort }, set: { viewModel.setSort($0) })) {
                        ForEach(OutfitSort.allCases) { sort in
                            Text(sort.label).tag(sort)
                        }
                    }
                    .pickerStyle(.inline)
                } label: {
                    ChipLabel(title: viewModel.sortLabel, isOn: viewModel.sort != .popular, opensMenu: true)
                }
                .accessibilityIdentifier("search.sort")

                if viewModel.hasFilters {
                    Button(Strings.searchClearFilters) { viewModel.clearFilters() }
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.primary)
                        .padding(.horizontal, AppSpacing.sm)
                        .frame(minHeight: AppSize.touchTarget)
                        .accessibilityIdentifier("search.clearFilters")
                }
            }
            .padding(.horizontal, AppSpacing.lg)
        }
    }

    // MARK: Results

    @ViewBuilder
    private var results: some View {
        if let error = viewModel.error, !viewModel.isLoading {
            LoadErrorState(error: error) { Task { await viewModel.search() } }
                .padding(.top, AppSpacing.xxl)
        } else if let results = viewModel.results {
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                HStack(spacing: AppSpacing.sm) {
                    Text(Strings.searchResultCount(count: results.count))
                        .font(AppTypography.label)
                        .foregroundStyle(AppColors.onSurfaceVariant)
                        .accessibilityIdentifier("search.resultCount")
                    if viewModel.isLoading {
                        ProgressView()
                            .controlSize(.small)
                            .accessibilityLabel(Strings.commonLoading)
                            .accessibilityIdentifier("state.loading")
                    }
                }
                if results.isEmpty {
                    EmptyState(icon: AppIcon.search, title: Strings.searchEmptyTitle, message: Strings.searchEmptyBody)
                        .padding(.top, AppSpacing.xl)
                } else {
                    OutfitGrid(outfits: results)
                        .accessibilityIdentifier("search.results")
                        .opacity(viewModel.isLoading ? 0.6 : 1)
                }
            }
            .padding(.horizontal, AppSpacing.lg)
        } else {
            LoadingState()
                .padding(.top, AppSpacing.xxl)
        }
    }
}

#Preview {
    NavigationStack {
        SearchScreen(viewModel: SearchViewModel(repository: InMemoryCatalogRepository()))
    }
}
