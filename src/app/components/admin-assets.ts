export const ADMIN_ASSETS = {
  branding: {
    logoFavicon: "/asset-union-logo.svg",
    logoFull: "/asset-union-logo.svg",
  },
  /**
   * Sidebar — exported SVGs from Figma `878:60983` (header + nav) and `878:61049` (settings, log out).
   * Files live under `public/images/admin/sidebar/`. Overview icons map to admin routes in order; Rewards
   * icons (refer / academy / coupons) map to compliance logs, notifications, and roles & permissions.
   */
  sidebar: {
    topAction: "/images/admin/sidebar/top-action.svg",
    nav: {
      dashboard: "/images/admin/sidebar/nav-dashboard.svg",
      propertyManagement: "/images/admin/sidebar/nav-property-management.svg",
      createListing: "/images/admin/sidebar/nav-create-listing.svg",
      rentSubmission: "/images/admin/sidebar/nav-rent-submission.svg",
      userManagement: "/images/admin/sidebar/nav-user-management.svg",
      governance: "/images/admin/sidebar/nav-governance.svg",
      complianceLogs: "/images/admin/sidebar/nav-compliance-logs.svg",
      notification: "/images/admin/sidebar/nav-notification.svg",
      rolesPermissions: "/images/admin/sidebar/nav-roles-permissions.svg",
    },
    utility: {
      settings: "/images/admin/sidebar/utility-settings.svg",
      logout: "/images/admin/sidebar/utility-logout.svg",
    },
  },
  /** Figma frame 878:88598 — icons under `public/images/admin/top-nav/`. */
  topNav: {
    avatar: "/images/admin/top-nav/avatar.png",
    bellSvg: "/images/admin/top-nav/bell.svg",
    usFlagSvg: "/images/admin/top-nav/us-flag.svg",
  },

  /**
   * Admin dashboard — stats row Figma `193:5786`; check icon component `24:186`.
   * Row thumbnail matches property-management table (`903:27938`).
   */
  dashboard: {
    propertyThumb: "/images/admin/property-management/property-thumb.jpg",
    statUsersIcon: "/images/admin/dashboard/stat-users.svg",
    statSuspendedIcon: "/images/admin/dashboard/stat-suspended.svg",
    /** Figma third card is “Wallets Not Whitelisted” (wallet glyph); used here for the third stats tile. */
    statPropertyIcon: "/images/admin/dashboard/stat-property.svg",
    activityCheckIcon: "/images/admin/dashboard/activity-check.svg",
  },

  propertyManagement: {
    /** Activity-area `903:27938` — SVG/UI under `public/images/admin/property-management/`. */
    propertyThumb: "/images/admin/property-management/property-thumb.jpg",
    searchIcon: "/images/admin/property-management/search.svg",
    chevronDown: "/images/admin/property-management/chevron-down.svg",
    rowMore: "/images/admin/property-management/row-more.svg",
    paginationPrev: "/images/admin/property-management/pagination-prev.svg",
    paginationNext: "/images/admin/property-management/pagination-next.svg",
    /** Approval slide-over header close (Figma node 878:34489) — exported SVG under /public. */
    approvalPanelClose: "/property-management/approval/close.svg",
    /** Rejected submission card gallery — Figma `878:38378`. */
    detailGallery: [
      "/images/admin/property-management/detail-gallery/01.jpg",
      "/images/admin/property-management/detail-gallery/02.png",
      "/images/admin/property-management/detail-gallery/03.jpg",
      "/images/admin/property-management/detail-gallery/04.jpg",
      "/images/admin/property-management/detail-gallery/05.jpg",
    ],
    /** Property detail / edit surfaces (Figma exports under /public/property-detail/). */
    detailPdfIcon: "/property-detail/icon-pdf.svg",
    detailEditIcon: "/property-detail/icon-edit.svg",
    detailPlayIcon: "/property-detail/icon-play.svg",
  },
  /**
   * Create listing — listing type step (Figma 878:42121). Radio icons as local SVGs under /public/create-listing/icons.
   */
  createListing: {
    icons: {
      radioSelected: "/create-listing/icons/radio-selected.svg",
      radioUnselected: "/create-listing/icons/radio-unselected.svg",
    },
    /** Legal doc row (Figma 878:45663 / Icons 878:21050, 878:21056). */
    legalDocumentation: {
      pdfRowIcon: "/images/admin/create-listing/legal-doc-pdf-icon.svg",
      deleteRowIcon: "/images/admin/create-listing/legal-doc-delete-icon.svg",
    },
    /**
     * Rental listing wizard (Figma 878:42809, 878:43717, 878:44256) — icons under
     * `public/images/admin/create-listing/rental/`.
     */
    rentalWizard: {
      chevronDown: "/images/admin/create-listing/rental/chevron-down.svg",
      coverImageUpload:
        "/images/admin/create-listing/rental/cover-image-upload.svg",
      galleryAdd: "/images/admin/create-listing/rental/gallery-add.svg",
      amenityCheckboxChecked:
        "/images/admin/create-listing/rental/amenity-checkbox-checked.svg",
      amenityCheckboxUnchecked:
        "/images/admin/create-listing/rental/amenity-checkbox-unchecked.svg",
      uploadPlusCircle:
        "/images/admin/create-listing/rental/upload-plus-circle.svg",
    },
  },
  /**
   * Rent submission table (Figma 878:51172) — icons under /public/rent-submission/icons, thumb PNG local.
   */
  rentSubmission: {
    propertyThumb: "/rent-submission/property-thumb.png",
    icons: {
      search: "/rent-submission/icons/search.svg",
      view: "/rent-submission/icons/view.svg",
      submitRent: "/rent-submission/icons/submit-rent.svg",
      paginationPrev: "/rent-submission/icons/pagination-prev.svg",
      paginationNext: "/rent-submission/icons/pagination-next.svg",
    },
    /** Sub-page 878:51723 — detail form; gallery PNGs; modal icon 878:53155. */
    detail: {
      gallery: [
        "/rent-submission/detail/gallery/interior-01.png",
        "/rent-submission/detail/gallery/interior-02.png",
        "/rent-submission/detail/gallery/interior-03.png",
        "/rent-submission/detail/gallery/interior-04.png",
        "/rent-submission/detail/gallery/interior-05.png",
      ],
      icons: {
        chevronBack: "/rent-submission/detail/icons/chevron-back.svg",
        dollar: "/rent-submission/detail/icons/dollar.svg",
        calendar: "/rent-submission/detail/icons/calendar.svg",
        plusCircle: "/rent-submission/detail/icons/plus-circle.svg",
        pdf: "/rent-submission/detail/icons/pdf.svg",
        trash: "/rent-submission/detail/icons/trash.svg",
        checkSmall: "/rent-submission/detail/icons/check-small.svg",
        distributionScheduled:
          "/rent-submission/detail/icons/distribution-scheduled.svg",
      },
    },
  },
  userManagement: {
    avatars: [
      "/user-management/avatars/avatar-01.png",
      "/user-management/avatars/avatar-02.png",
      "/user-management/avatars/avatar-03.png",
      "/user-management/avatars/avatar-04.png",
      "/user-management/avatars/avatar-05.png",
      "/user-management/avatars/avatar-06.png",
      "/user-management/avatars/avatar-07.png",
    ],
    icons: {
      chevronDown: "/user-management/icons/chevron-down.svg",
      chevronBack: "/rent-submission/detail/icons/chevron-back.svg",
      copy: "/user-management/icons/copy.svg",
    },
    rowOptions: {
      trigger: "/user-management/icons/row-options-trigger.svg",
      view: "/user-management/icons/view.svg",
      freezeWallet: "/user-management/icons/freeze-wallet.svg",
      unfreezeWallet: "/user-management/icons/unfreeze-wallet.svg",
      suspend: "/user-management/icons/suspend.svg",
      reactivate: "/user-management/icons/reactivate.svg",
      revokeWhitelist: "/user-management/icons/revoke-whitelist.svg",
    },
  },
  /** Compliance Logs — avatars from Figma exports; UI icons as local SVGs under /public/compliance-logs/icons. */
  complianceLogs: {
    icons: {
      search: "/compliance-logs/icons/search.svg",
      chevronDown: "/compliance-logs/icons/chevron-down.svg",
      paginationPrev: "/compliance-logs/icons/pagination-prev.svg",
      paginationNext: "/compliance-logs/icons/pagination-next.svg",
      checkboxUnchecked: "/compliance-logs/icons/checkbox-unchecked.svg",
      rowDivider: "/compliance-logs/icons/row-divider.svg",
    },
    investors: {
      avatars: [
        "/compliance-logs/investors/avatar-1.png",
        "/compliance-logs/investors/avatar-2.png",
        "/compliance-logs/investors/avatar-3.png",
      ],
    },
    usersKyc: {
      avatars: [
        "/compliance-logs/users-kyc/avatar-1.png",
        "/compliance-logs/users-kyc/avatar-2.png",
        "/compliance-logs/users-kyc/avatar-3.png",
      ],
    },
  },
  /**
   * Roles & Permissions — Card node 903:47984 (Figma MCP export to /public).
   * Table action order: document (878:21072), eye (878:21059), user audit (878:21096).
   */
  rolesPermissions: {
    avatars: [
      "/roles-permissions/avatars/user-1.png",
      "/roles-permissions/avatars/user-2.png",
      "/roles-permissions/avatars/user-3.png",
      "/roles-permissions/avatars/user-4.png",
      "/roles-permissions/avatars/user-5.png",
      "/roles-permissions/avatars/user-6.png",
      "/roles-permissions/avatars/user-7.png",
    ],
    icons: {
      addAdmin: "/roles-permissions/icons/add-admin-figma.svg",
      chevronDown: "/roles-permissions/icons/chevron-down-figma.svg",
      paginationPrev: "/roles-permissions/icons/pagination-prev-figma.svg",
      paginationNext: "/roles-permissions/icons/pagination-next-figma.svg",
      adminTableDetails: "/roles-permissions/icons/table-action-details.svg",
      adminTableView: "/roles-permissions/icons/table-action-view.svg",
      adminTableManage: "/roles-permissions/icons/table-action-manage.svg",
      pendingDetails: "/roles-permissions/icons/pending-details.svg",
      pendingRemove: "/roles-permissions/icons/pending-remove.svg",
      search: "/compliance-logs/icons/search.svg",
    },
  },
  /**
   * Governance — ported from investor dashboard; SVGs under /public/governance.
   */
  governance: {
    voteConfirmHeader: "/governance/vote-confirm-header.svg",
    modalClose: "/governance/modal-close.svg",
    proposalType: {
      capexBg: "/governance/proposal-type/capex-bg.svg",
      capexIcon: "/governance/proposal-type/capex-icon.svg",
      saleBg: "/governance/proposal-type/sale-bg.svg",
      saleIcon: "/governance/proposal-type/sale-icon.svg",
      rentalBg: "/governance/proposal-type/rental-bg.svg",
      rentalIcon: "/governance/proposal-type/rental-icon.svg",
      emergencyCombined: "/governance/proposal-type/emergency-combined.svg",
      managerBg: "/governance/proposal-type/manager-bg.svg",
      managerIcon: "/governance/proposal-type/manager-icon.svg",
    },
  },
  /** Notifications — local SVGs under /public/notifications/icons (Figma 903:44013 list, 903:45681 create). */
  notifications: {
    icons: {
      search: "/notifications/icons/search.svg",
      chevronDown: "/notifications/icons/chevron-down.svg",
      create: "/notifications/icons/create-notification.svg",
      rowAction: "/notifications/icons/row-action.svg",
      chevronBack: "/notifications/icons/chevron-back.svg",
      calendar: "/notifications/icons/calendar.svg",
      clock: "/notifications/icons/clock.svg",
      checkboxChecked: "/notifications/icons/checkbox-checked.svg",
      checkboxUnchecked: "/notifications/icons/checkbox-unchecked.svg",
      radioSelected: "/notifications/icons/radio-selected.svg",
      radioUnselected: "/notifications/icons/radio-unselected.svg",
    },
    createIcon: "/notifications/icons/create-notification.svg",
    rowActionIcon: "/notifications/icons/row-action.svg",
    backIcon: "/notifications/icons/chevron-back.svg",
    calendarIcon: "/notifications/icons/calendar.svg",
    timeIcon: "/notifications/icons/clock.svg",
  },
} as const;

export type AdminAssetGroups = typeof ADMIN_ASSETS;
