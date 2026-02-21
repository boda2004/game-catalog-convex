# Changelog

## [1.11.0](https://github.com/boda2004/game-catalog-convex/compare/v1.10.0...v1.11.0) (2026-02-21)


### Features

* allow game name column in table to wrap text by conditionally applying `whitespace-nowrap`. ([40e6eea](https://github.com/boda2004/game-catalog-convex/commit/40e6eead01566f775f0712cfddbf1679c01b37ce))

## [1.10.0](https://github.com/boda2004/game-catalog-convex/compare/v1.9.0...v1.10.0) (2026-02-21)


### Features

* Implement modal close functionality via Escape key and backdrop click for all modals. ([35e4512](https://github.com/boda2004/game-catalog-convex/commit/35e451275175563ab3e94140b5c618f3b1020820))

## [1.9.0](https://github.com/boda2004/game-catalog-convex/compare/v1.8.0...v1.9.0) (2025-10-30)


### Features

* removed limit and filter for steam import ([4f51b96](https://github.com/boda2004/game-catalog-convex/commit/4f51b96b9d76c167778fdc8f249a3615763f5149))

## [1.8.0](https://github.com/boda2004/game-catalog-convex/compare/v1.7.0...v1.8.0) (2025-09-13)


### Features

* **auth:** integrate Resend API for password reset emails ([#19](https://github.com/boda2004/game-catalog-convex/issues/19)) ([d4ec559](https://github.com/boda2004/game-catalog-convex/commit/d4ec559678b92a9321c587d41fd68af3da6d4724))

## [1.7.0](https://github.com/boda2004/game-catalog-convex/compare/v1.6.1...v1.7.0) (2025-09-13)


### Features

* **auth:** add password reset functionality ([ac1bf95](https://github.com/boda2004/game-catalog-convex/commit/ac1bf9580b85b1d23f04b91526a3582c1dc58be5))

## [1.6.1](https://github.com/boda2004/game-catalog-convex/compare/v1.6.0...v1.6.1) (2025-08-21)


### Bug Fixes

* **dropdown:** prevent overflow beyond right edge of screen ([#16](https://github.com/boda2004/game-catalog-convex/issues/16)) ([b8d3b96](https://github.com/boda2004/game-catalog-convex/commit/b8d3b96e3c5b6b66f804ff69950b005de26359bf))

## [1.6.0](https://github.com/boda2004/game-catalog-convex/compare/v1.5.0...v1.6.0) (2025-08-19)


### Features

* Allow editing of game store ownership ([#14](https://github.com/boda2004/game-catalog-convex/issues/14)) ([99288b6](https://github.com/boda2004/game-catalog-convex/commit/99288b66be9239dbfb0cb2fcb42459f64fc5298c))

## [1.5.0](https://github.com/boda2004/game-catalog-convex/compare/v1.4.0...v1.5.0) (2025-08-17)


### Features

* **games:** add GOG store ownership support ([2d98151](https://github.com/boda2004/game-catalog-convex/commit/2d981511db0d88967f68fe4d51e254a44bac704a))

## [1.4.0](https://github.com/boda2004/game-catalog-convex/compare/v1.3.0...v1.4.0) (2025-08-16)


### Features

* **games:** add store ownership management and filtering ([93513a3](https://github.com/boda2004/game-catalog-convex/commit/93513a33a634fd62376e919d4acaecde447cb8cb))


### Bug Fixes

* **games:** refactor ownership handling in addGameToUserInternal ([9485b46](https://github.com/boda2004/game-catalog-convex/commit/9485b46c0302b500f9c722fe53911596a069a572))

## [1.3.0](https://github.com/boda2004/game-catalog-convex/compare/v1.2.0...v1.3.0) (2025-08-09)


### Features

* update App component and Vite configuration ([#10](https://github.com/boda2004/game-catalog-convex/issues/10)) ([4ec7ecd](https://github.com/boda2004/game-catalog-convex/commit/4ec7ecd1086092e9d63232f140d34401dafdf6c3))

## [1.2.0](https://github.com/boda2004/game-catalog-convex/compare/v1.1.1...v1.2.0) (2025-08-09)


### Features

* **readme:** add Release Please demo section ([#7](https://github.com/boda2004/game-catalog-convex/issues/7)) ([58b346b](https://github.com/boda2004/game-catalog-convex/commit/58b346bef2d4531b7ffaefbcd3212e6cb434c3db))


### Bug Fixes

* **readme:** correct spacing and hyphenation ([#8](https://github.com/boda2004/game-catalog-convex/issues/8)) ([50d35da](https://github.com/boda2004/game-catalog-convex/commit/50d35da365c629fdfea640f1fce89694ee6f0fa7))

## [1.1.1](https://github.com/boda2004/game-catalog-convex/compare/v1.1.0...v1.1.1) (2025-08-09)


### Bug Fixes

* trigger release-please (test) ([#4](https://github.com/boda2004/game-catalog-convex/issues/4)) ([d52cc7f](https://github.com/boda2004/game-catalog-convex/commit/d52cc7f44555888c1dee113181eec8237a8f0e26))

## [1.1.0](https://github.com/boda2004/game-catalog-convex/compare/v1.0.0...v1.1.0) (2025-08-09)


### Features

* add favicon to improve site branding ([d446123](https://github.com/boda2004/game-catalog-convex/commit/d44612341a736bf3d4f8169c85a390bf7f3ebb46))
* **components:** add click-outside handlers for dropdown menus ([6b81292](https://github.com/boda2004/game-catalog-convex/commit/6b8129260205a6b2f3773bfba857f7b4433bea86))
* **components:** add shared Dropdown component and replace custom dropdowns ([d53cbf5](https://github.com/boda2004/game-catalog-convex/commit/d53cbf5947de2e7b6276fc505f0c78f66d620bcb))
* **components:** add sorting functionality to GameGrid ([9153072](https://github.com/boda2004/game-catalog-convex/commit/91530729b445228a0255148772ed6fe8bf96f49b))
* **components:** enhance ComboBox and Dropdown with portal rendering and improved click-outside handling ([a043a8b](https://github.com/boda2004/game-catalog-convex/commit/a043a8b8cb68ce84d7f882bd30b20695b455f544))
* **components:** enhance FilterBar with platform and genre filters ([d37a10b](https://github.com/boda2004/game-catalog-convex/commit/d37a10bb025b1e922df74c9398e2abae18edb6ca))
* **components:** implement ComboBox for pagination controls in GameGrid and GameTable ([5bcbe2d](https://github.com/boda2004/game-catalog-convex/commit/5bcbe2da13b15e5d09b7324f2b26cfd7347ea2ea))
* **components:** integrate sorting controls into GameGrid and GameCatalog ([6d6b08e](https://github.com/boda2004/game-catalog-convex/commit/6d6b08e79dfea22e9f7d0956e4082bd67f5599e2))
* **deploy:** add GitHub Actions workflow for Convex deployment ([43cd3a1](https://github.com/boda2004/game-catalog-convex/commit/43cd3a1a4543cc4e20708af5466233cda2da50a5))
* **deploy:** add GitHub Actions workflow for deployment to GitHub Pages ([bfa3729](https://github.com/boda2004/game-catalog-convex/commit/bfa37297ae507fcc32a56cdf0e59071307217e9f))
* **Dropdown:** add click-outside handler to close dropdown ([a0e4f5d](https://github.com/boda2004/game-catalog-convex/commit/a0e4f5dc84eb4e826cdcda03b1f0dc8d7e474e79))
* **GameGrid/GameTable:** add platform and genre filter components ([9fd3e62](https://github.com/boda2004/game-catalog-convex/commit/9fd3e627012a44a66fa0b52b2622c5a6fe7728e5))
* **games:** enhance game addition logic to indicate ownership status ([22cc8af](https://github.com/boda2004/game-catalog-convex/commit/22cc8afbed56a68dc1e2894313c66625d78efca0))
* **games:** prevent duplicate game additions in catalog ([ba3087b](https://github.com/boda2004/game-catalog-convex/commit/ba3087baee700c6dd7ca16ddf722ebe3b03e057e))
* **import:** implement import job tracking for bulk and Steam game imports ([8d135f2](https://github.com/boda2004/game-catalog-convex/commit/8d135f2aadab3f0371ae74ffded82c826a94ef7a))
* **main:** release 1.0.0 ([#1](https://github.com/boda2004/game-catalog-convex/issues/1)) ([e125e5b](https://github.com/boda2004/game-catalog-convex/commit/e125e5b0f22855aa54d2251b02e840920704773d))
* **rawg:** implement retry logic for RAWG API requests ([c0ed177](https://github.com/boda2004/game-catalog-convex/commit/c0ed177813650451292262a51d94e384509be493))
* **steam:** add Steam game import functionality and UI ([95ef491](https://github.com/boda2004/game-catalog-convex/commit/95ef491d4195f62d8b179e4c8326cb1ceaa93d56))


### Bug Fixes

* **components:** refine FilterBar active filters logic ([69ed37e](https://github.com/boda2004/game-catalog-convex/commit/69ed37e2b29f4ff421fa7d84c7b1386d8a77f3a4))
* **components:** update pagination logic in GameCatalog and enhance PaginationControls ([1624650](https://github.com/boda2004/game-catalog-convex/commit/16246504d645df80b0c5535abb7f24d81605d8e5))
* **GameTable:** adjust filterable combo styling and fix sort indicator display ([d9faa64](https://github.com/boda2004/game-catalog-convex/commit/d9faa647e616d2299058e3471c2f3467a2a03f4d))
* **lint:** update lint script to remove unnecessary 'dev' command and streamline type-checking process ([207711f](https://github.com/boda2004/game-catalog-convex/commit/207711fda51444b01b96c06d5882e7a7a05818bb))

## 1.0.0 (2025-08-09)


### Features

* add favicon to improve site branding ([d446123](https://github.com/boda2004/game-catalog-convex/commit/d44612341a736bf3d4f8169c85a390bf7f3ebb46))
* **components:** add click-outside handlers for dropdown menus ([6b81292](https://github.com/boda2004/game-catalog-convex/commit/6b8129260205a6b2f3773bfba857f7b4433bea86))
* **components:** add shared Dropdown component and replace custom dropdowns ([d53cbf5](https://github.com/boda2004/game-catalog-convex/commit/d53cbf5947de2e7b6276fc505f0c78f66d620bcb))
* **components:** add sorting functionality to GameGrid ([9153072](https://github.com/boda2004/game-catalog-convex/commit/91530729b445228a0255148772ed6fe8bf96f49b))
* **components:** enhance ComboBox and Dropdown with portal rendering and improved click-outside handling ([a043a8b](https://github.com/boda2004/game-catalog-convex/commit/a043a8b8cb68ce84d7f882bd30b20695b455f544))
* **components:** enhance FilterBar with platform and genre filters ([d37a10b](https://github.com/boda2004/game-catalog-convex/commit/d37a10bb025b1e922df74c9398e2abae18edb6ca))
* **components:** implement ComboBox for pagination controls in GameGrid and GameTable ([5bcbe2d](https://github.com/boda2004/game-catalog-convex/commit/5bcbe2da13b15e5d09b7324f2b26cfd7347ea2ea))
* **components:** integrate sorting controls into GameGrid and GameCatalog ([6d6b08e](https://github.com/boda2004/game-catalog-convex/commit/6d6b08e79dfea22e9f7d0956e4082bd67f5599e2))
* **deploy:** add GitHub Actions workflow for Convex deployment ([43cd3a1](https://github.com/boda2004/game-catalog-convex/commit/43cd3a1a4543cc4e20708af5466233cda2da50a5))
* **deploy:** add GitHub Actions workflow for deployment to GitHub Pages ([bfa3729](https://github.com/boda2004/game-catalog-convex/commit/bfa37297ae507fcc32a56cdf0e59071307217e9f))
* **Dropdown:** add click-outside handler to close dropdown ([a0e4f5d](https://github.com/boda2004/game-catalog-convex/commit/a0e4f5dc84eb4e826cdcda03b1f0dc8d7e474e79))
* **GameGrid/GameTable:** add platform and genre filter components ([9fd3e62](https://github.com/boda2004/game-catalog-convex/commit/9fd3e627012a44a66fa0b52b2622c5a6fe7728e5))
* **games:** enhance game addition logic to indicate ownership status ([22cc8af](https://github.com/boda2004/game-catalog-convex/commit/22cc8afbed56a68dc1e2894313c66625d78efca0))
* **games:** prevent duplicate game additions in catalog ([ba3087b](https://github.com/boda2004/game-catalog-convex/commit/ba3087baee700c6dd7ca16ddf722ebe3b03e057e))
* **import:** implement import job tracking for bulk and Steam game imports ([8d135f2](https://github.com/boda2004/game-catalog-convex/commit/8d135f2aadab3f0371ae74ffded82c826a94ef7a))
* **rawg:** implement retry logic for RAWG API requests ([c0ed177](https://github.com/boda2004/game-catalog-convex/commit/c0ed177813650451292262a51d94e384509be493))
* **steam:** add Steam game import functionality and UI ([95ef491](https://github.com/boda2004/game-catalog-convex/commit/95ef491d4195f62d8b179e4c8326cb1ceaa93d56))


### Bug Fixes

* **components:** refine FilterBar active filters logic ([69ed37e](https://github.com/boda2004/game-catalog-convex/commit/69ed37e2b29f4ff421fa7d84c7b1386d8a77f3a4))
* **components:** update pagination logic in GameCatalog and enhance PaginationControls ([1624650](https://github.com/boda2004/game-catalog-convex/commit/16246504d645df80b0c5535abb7f24d81605d8e5))
* **GameTable:** adjust filterable combo styling and fix sort indicator display ([d9faa64](https://github.com/boda2004/game-catalog-convex/commit/d9faa647e616d2299058e3471c2f3467a2a03f4d))
