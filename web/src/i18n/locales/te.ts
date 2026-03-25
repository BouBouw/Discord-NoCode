import type { TranslationKeys } from '../keys';

const te: TranslationKeys = {
  common: {
    save: 'Save',
    saved: 'Saved',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    add: 'Add',
    close: 'Close',
    refresh: 'Refresh',
    retry: 'Retry',
    loading: 'Loading?',
    error: 'Error',
    success: 'Success',
    name: 'Name',
    status: 'Status',
    type: 'Type',
    actions: 'Actions',
    back: 'Back',
    or: 'or',
    none: 'None',
    copy: 'Copy',
    copied: 'Copied!',
  },

  sidebar: {
    instances: 'Instances',
    databases: 'Databases',
    settings: 'Settings',
    logout: 'Log out',
    expand: 'Expand',
    collapse: 'Collapse',
    partner: 'Partner',
  
  },

  dashboard: {
    title: 'Dashboard',
    instances: 'Instances',
    newInstance: 'New instance',
    total: 'Total',
    totalDesc: 'instances created',
    active: 'Active',
    activeDesc: 'currently running',
    errors: 'Errors',
    stopped: 'Stopped',
    errorsDesc: 'instance(s) in error',
    stoppedDesc: 'offline',
    yourInstances: 'Your instances',
    noInstances: 'No instances',
    noInstancesDesc: 'Create your first instance to start building a Discord bot.',
    createInstance: 'Create an instance',
    viewInstance: 'View instance',
    start: 'Start',
    stop: 'Stop',
    modify: 'Edit',
    deleteConfirm: 'Delete this instance?',
    workflow: 'Workflow',
    executionChart: 'Execution Activity',
    executionChartDesc: 'Workflow executions over time',
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    completed: 'Completed',
    failed: 'Failed',
    executions: 'Executions',
    activityFeed: 'Recent Activity',
    activityFeedDesc: 'Latest events across your instances',
    noActivity: 'No activity yet',
    noActivityDesc: 'Start an instance to see activity here.',
    executionCompleted: 'Workflow execution completed',
    executionFailed: 'Workflow execution failed',
    executionRunning: 'Workflow execution started',
    botStarted: 'Instance started',
    botStopped: 'Instance stopped',
    botErrored: 'Instance error',
    timeAgo: 'ago',
    errorRate: 'Error Rate',
    errorRateDesc: 'Failed executions over total',
    totalErrors: 'Total errors',
    totalExecutions: 'Total executions',
    noErrors: 'No errors',
    resourceUsage: 'Resources',
    cpu: 'CPU',
    memory: 'Memory',
    network: 'Network',
    notRunning: 'Not running',
    quickDeploy: 'Quick Deploy',
    quickDeployDesc: 'Deploy your latest workflow changes',
    lastModified: 'Last modified',
    deploy: 'Deploy',
    noWorkflows: 'No workflows',
    noWorkflowsDesc: 'Create a workflow to deploy.',
    uptime: 'Uptime',
    uptimeDesc: 'Time since last start',
    since: 'since',
    filterAll: 'All',
    filterRunning: 'Running',
    filterStopped: 'Stopped',
    filterError: 'Error',
    searchPlaceholder: 'Search instances...',
    workflows: 'Workflows',
    totalWorkflows: 'total workflows',
    totalExecs: 'total executions',
    runningExecs: 'running now',
    statusBreakdown: 'Status Breakdown',
    sortName: 'Name',
    sortDate: 'Date',
    sortStatus: 'Status',
    viewGrid: 'Grid',
    viewList: 'List',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    startSelected: 'Start selected',
    stopSelected: 'Stop selected',
    deleteSelected: 'Delete selected',
    selected: 'selected',
    errorBanner: 'bot(s) in error ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ view details',
    errorBannerAction: 'View',
    toastStarted: 'Instance started successfully',
    toastStopped: 'Instance stopped successfully',
    toastDeleted: 'Instance deleted successfully',
    toastCreated: 'Instance created successfully',
    toastError: 'Action failed',
  },

  status: {
    idle: 'Idle',
    running: 'Active',
    stopped: 'Stopped',
    error: 'Error',
    online: 'Online',
    offline: 'Offline',
    nonexistent: 'Nonexistent',
    pending: 'Pending',
    accepted: 'Accepted',
  },

  instance: {
    restart: 'Restart',
    restarting: 'Restarting?',
    stopping: 'Stopping?',
    starting: 'Starting?',
    container: 'Container',
    port: 'Port',
    errorsLogs: 'Errors (logs)',
    commandsDetected: 'Commands detected',
    console: 'Console',
    activity: 'Activity',
    refreshLogs: 'Refresh logs',
    clear: 'Clear',
    autoScroll: 'Auto-scroll',
    waitingLogs: 'Waiting for logs?',
    botNotActive: 'The bot is not active. Start it to see the logs.',
    info: 'Information',
    createdAt: 'Created on',
    logSummary: 'Log summary',
    warn: 'Warn',
    debug: 'Debug',
    errorsWarn: 'Errors / Warn',
    lines: 'lines',
    uptime: 'Uptime',
    cpu: 'CPU',
    memory: 'Memory',
    network: 'Network',
    pids: 'Processes',
    live: 'LIVE',
    offline: 'OFFLINE',
    filterAll: 'All',
    filterErrors: 'Errors',
    filterWarns: 'Warnings',
    filterInfo: 'Info',
    filterDebug: 'Debug',
    searchLogs: 'Search logs...',
    quickActions: 'Quick Actions',
    openWorkflow: 'Open Workflow',
    viewDatabase: 'View Database',
    purgeLogs: 'Purge Logs',
    noResourceData: 'No resource data available',
    since: 'since',
    resourceHistory: 'Resource History',
    notRunning: 'Not running',
    dbStatus: 'Database',
    dbRunning: 'Running',
    dbStopped: 'Stopped',
    dbTables: 'Tables',
    containerId: 'Container ID',
    exportLogs: 'Export',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    showingLines: 'Showing {count} / {total} lines',
    showTimestamps: 'Show timestamps',
    hideTimestamps: 'Hide timestamps',
    rename: 'Rename',
    renameSuccess: 'Bot renamed successfully',
    configuration: 'Configuration',
    discordToken: 'Token',
    dbPort: 'DB Port',
    executions: 'Executions',
    noExecutions: 'No executions yet',
    pollingActive: 'Live polling active',
    highUsage: 'High usage',
  },

  databases: {
    title: 'Databases',
    description: 'Each instance includes MariaDB in its Docker container. Manage credentials and view your data.',
    noInstances: 'No instances found',
    noInstancesDesc: 'Create a bot from the Instances page first.',
    goToInstances: 'Go to Instances',
    instanceCol: 'Instance',
    engine: 'Engine',
    containerPort: 'Container / Port',
    dbStatus: 'DB status',
    openViewer: 'Open viewer',
    purgeAll: 'Purge all data',
    credentials: 'Connection credentials',
    host: 'Host',
    base: 'Database',
    user: 'User',
    password: 'Password',
    purgeConfirm: 'Delete all tables?',
    purged: 'Database purged.',
    purge: 'Purge',
  },

  dbViewer: {
    tables: 'Tables',
    noTables: 'No tables',
    createTable: 'Create a table',
    selectTable: 'Select a table from the sidebar',
    newTable: 'New table',
    addRow: 'Add a row',
    data: 'Data',
    structure: 'Structure',
    sql: 'SQL',
    tableName: 'Table name',
    tableNamePlaceholder: 'e.g. users',
    columns: 'Columns',
    tableNameRequired: 'Table name is required.',
    columnNamesRequired: 'All column names are required.',
    createError: 'Error during creation.',
    newColumn: 'New column',
    defaultOpt: 'Default (opt.)',
    nameRequired: 'Name required',
    noData: 'No data',
    insertRow: 'Insert a row',
    insertInto: 'Insert a row into',
    editRowIn: 'Edit a row in',
    noPrimaryKey: 'No primary key found.',
    column: 'Column',
    null_: 'Null',
    key: 'Key',
    default_: 'Default',
    extra: 'Extra',
    deleteColumn: 'Delete column',
    addColumn: 'Add a column',
    dropTable: 'Drop table',
    deleteRowWhere: 'Delete row where',
    dropTableConfirm: 'Drop this table and all its data?',
    dropColumnConfirm: 'Drop column',
    page: 'Page',
    dbUnavailable: 'Database unavailable',
    dbUnavailableDesc: 'The bot\'s database is not accessible. Two possible causes:',
    dbUnavailableCause1: 'The bot is not started ? start it from the Dashboard.',
    dbUnavailableCause2: 'The container was created before the built-in MySQL update ? delete and recreate the bot to reset its container.',
    confirmAction: 'Confirm action',
    operationSuccess: 'Operation successful.',
    columnAdded: 'Column added.',
    rowInserted: 'Row inserted.',
    rowUpdated: 'Row updated.',
    tableCreated: 'Table created.',
    sqlRunner: 'SQL Runner',
    execute: 'Execute',
    ctrlEnter: 'Ctrl+Enter to execute',
    noResults: 'No results.',
    rowsAffected: 'row(s)',
    linesAffected: 'row(s) affected',
    insertId: 'Insert ID',
  },

  settings: {
    title: 'Settings',
    general: 'General',
    subscription: 'Subscription',
    notifications: 'Notifications',
    profile: 'Profile',
    profileDesc: 'Your account information.',
    memberSince: 'Member since',
    discordLinked: 'Discord linked',
    discordNotLinked: 'Discord not linked',
    linkDiscord: 'Link Discord',
    linkDiscordDesc: 'Link your Discord account (must use the same email)',
    unlinkDiscord: 'Unlink Discord account',
    discordLinkSuccess: 'Discord account linked successfully!',
    discordUnlinkSuccess: 'Discord account unlinked successfully.',
    discordLinkFailed: 'Failed to link Discord account. Please try again.',
    discordEmailMismatch: 'The Discord account email does not match your registered email.',
    discordAlreadyLinked: 'This Discord account is already linked to another user.',
    planFree: 'Free Plan',
    editProfile: 'Edit profile',
    instanceDefaults: 'New instance settings',
    instanceDefaultsDesc: 'Automatically applied when creating a new instance.',
    instanceDefaultsBanner: 'These settings define the language and theme applied to each new instance created. You can change them per instance after creation.',
    defaultLanguage: 'Default language',
    defaultTheme: 'Default theme',
    themeDark: 'Dark',
    themeDarkDesc: 'Black & gray',
    themeLight: 'Light',
    themeLightDesc: 'White & gray',
    security: 'Security',
    securityDesc: 'Manage your password and access.',
    changePassword: 'Change password',
    changePasswordDesc: 'Change your login password',
    currentPlan: 'Current plan',
    freeAutoRenew: 'Free ? Auto renew',
    botInstances3: '3 bot instances',
    workflows5: '5 workflows per bot',
    integratedDb: 'Integrated database (MySQL)',
    realtimeLogs: 'Real-time logs',
    communitySupport: 'Community support',
    unlimitedInstances: 'Unlimited instances',
    unlimitedWorkflows: 'Unlimited workflows',
    prioritySupport: 'Priority support',
    customDomain: 'Custom domain',
    proTitle: 'DisFlow Pro',
    proDesc: 'Everything you need for professional bots.',
    multipleDbs: 'Multiple databases',
    prioritySupport247: 'Priority support 24/7',
    advancedAnalytics: 'Advanced analytics',
    upgradePro: 'Upgrade to Pro',
    emailNotifications: 'Email notifications',
    emailNotificationsDesc: 'Choose which events you want to be notified about.',
    notifStartStop: 'Instance start / stop',
    notifStartStopDesc: 'Receive an email for every bot status change.',
    notifErrors: 'Critical errors',
    notifErrorsDesc: 'Be alerted when a bot encounters a blocking error.',
    notifWeekly: 'Weekly report',
    notifWeeklyDesc: 'A summary of your bots\' activity every Monday.',
    notifMarketing: 'Offers & news',
    notifMarketingDesc: 'Stay informed about new features and promotions.',
    autoSaved: 'Changes are saved automatically.',
    planPro: 'Pro',
    planBusiness: 'Business',
    priceMonth: '/month',
    currentPlanLabel: 'Current plan',
    active: 'Active',
    cancelPending: 'Cancels at end of period',
    manageSubscription: 'Manage subscription',
    changePlan: 'Change plan',
    usage: 'Usage',
    bots: 'Bots',
    commandsPerBot: 'Commands per bot',
    eventsPerBot: 'Events per bot',
    dbSize: 'Database size',
    aiCredits: 'AI Credits',
    unlimited: 'Unlimited',
    usedOf: 'used of',
    upgradeNow: 'Upgrade',
    downgradeFree: 'Downgrade to Free',
    businessTitle: 'Business',
    businessDesc: 'For teams and ambitious projects. Everything unlimited with priority support.',
    creditResetsOn: 'Resets on',
    cancelInfo: 'Your subscription will remain active until the end of the current period.',
    priceYear: '/year',
    monthly: 'Monthly',
    annual: 'Annual',
    savePercent: '-17%',
    annualSaving: 'Save vs.',
    membersPerBot: 'members/bot',
    extraSeat: 'extra seat/mo',
  },

  members: {
    title: 'Members',
    backToDashboard: 'Back to dashboard',
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
    inviteCollaborator: 'Invite a collaborator',
    invite: 'Invite',
    sent: 'Sent!',
    readOnly: 'Read only',
    canEditWorkflow: 'Can edit the workflow',
    fullManagement: 'Full management + invitations',
    collaborators: 'Collaborators',
    hierarchy: 'Hierarchy',
    chooseNewRole: 'Choose a new role',
    changeRole: 'Change role',
    removeFromWorkflow: 'Remove from workflow',
    removeConfirm: 'Remove from workflow?',
    noCollaborators: 'No collaborators ? invite someone above.',
    noWorkflowSelected: 'No workflow selected.',
    member: 'member',
    members_: 'members',
  },

  botModal: {
    editInstance: 'Edit instance',
    newInstance: 'New instance',
    instanceName: 'Instance name',
    discordToken: 'Discord Token',
    namePlaceholder: 'My awesome bot',
    tokenPlaceholder: 'MTAw...',
    tokenHelp: 'Get your token from the Discord Developer Portal',
    tokenUpdateHint: '???????? ????????? ????????? ?????? ??????',
    tokenUpdateHelp: '???????? ????????? ????????? ?????? ??????. ?????????????? ???? ??????? ???????????? ????? ?????????????.',
    settingsApplied: 'Settings applied:',
    createInstance: 'Create instance',
    update: 'Update',
    saving: 'Saving...',
    nameRequired: 'Bot name is required',
    tokenRequired: 'Discord token is required for new bots',
    saveFailed: 'Failed to save:',
  },

  auth: {
    login: 'Login',
    loginWelcome: 'Welcome back ??',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '????????',
    continueDiscord: 'Continue with Discord',
    signIn: 'Sign in',
    noAccount: 'No account yet?',
    signUp: 'Sign up',
    register: 'Create an account',
    registerSubtitle: 'Start building your bots today',
    confirmPassword: 'Confirm password',
    minChars: 'Min. 8 characters',
    registerDiscord: 'Sign up with Discord',
    createAccount: 'Create my account',
    hasAccount: 'Already have an account?',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    unknownError: 'Unknown error',
    loginError: 'Login error',
    discordFailed: 'Discord login failed, please try again.',
    discordCancelled: 'Discord login cancelled.',
    brandTagline: 'Build powerful Discord bots with a visual editor. Without writing a single line of code.',
    feature1: 'Drag & drop workflow editor',
    feature2: 'All DiscordJS v14 features',
    feature3: 'One-click deployment',
  },

  landing: {
    dashboard: 'Dashboard',
    login: 'Login',
    getStarted: 'Get started',
    logoutBtn: 'Log out',
    heroTitle: 'Discord Automation ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ No-Code',
    heroSubtitle: 'Create Discord bots without writing a line of code',
    heroDesc: 'Visual workflow editor, all DiscordJS v14 actions, instant deployment. From design to live in minutes.',
    startFree: 'Start for free',
    viewDemo: 'View demo',
    freeToStart: 'Free to start',
    noCardRequired: 'No card required',
    oneClickDeploy: 'One-click deploy',
    dualTitle: 'A design for every moment',
    dualSubtitle: 'Premium UI ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Dual Mode',
    dualDesc: 'Switch between clean light mode and immersive dark mode ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ both crafted for excellence.',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    lightDesc: 'Crisp & minimal ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ designed for focus',
    darkDesc: 'Sleek & immersive ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ built for power users',
    statUsers: 'Active users',
    statBots: 'Bots deployed',
    statUptime: 'Guaranteed uptime',
    statRating: 'Average rating',
    featuresLabel: 'Features',
    featuresTitle: 'Everything you need',
    featuresSub: 'A complete platform to design, test, and deploy your Discord bots.',
    feat1Title: 'Visual drag & drop editor',
    feat1Desc: 'Create complex workflows visually. Conditions, loops, delays, branching ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ it\'s all there.',
    feat2Title: 'Full DiscordJS v14',
    feat2Desc: 'Access all DiscordJS features: messages, roles, moderation, slash commands, events.',
    feat3Title: 'Secure & isolated',
    feat3Desc: 'Each bot runs in its own Docker container with full isolation and security.',
    feat4Title: 'Smart Slash Commands',
    feat4Desc: 'Define slash commands visually with parameters, permissions, and auto-complete ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ no boilerplate needed.',
    popular: 'Popular',
    stepsLabel: 'Process',
    stepsTitle: 'In 3 simple steps',
    stepsSub: 'From idea to live Discord bot, without touching a single line of code.',
    step1Title: 'Create a bot',
    step1Desc: 'Register your Discord token and name your instance. Ready in 60 seconds.',
    step2Title: 'Design the workflow',
    step2Desc: 'Add triggers, conditions and actions from the complete node library.',
    step3Title: 'Deploy in one click',
    step3Desc: 'Your bot is online and running your workflows in real-time, with built-in logs.',
    ctaTitle: 'Ready to build?',
    ctaDesc: 'Join thousands of creators who automate their Discord servers without writing code.',
    ctaButton: 'Create a free account',
    footer: 'ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ 2026 DisFlow ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ All rights reserved',
    navBenefits: 'Benefits',
    navTestimonials: 'Testimonials',
    navPricing: 'Pricing',
    basedOnReviews: 'based on 2,400+ reviews',
    trustedBy: 'Trusted by communities worldwide',
    benefitsLabel: 'Benefits',
    benefitsTitle: 'Why creators choose DisFlow',
    benefitsSub: 'Everything you need to go from idea to live Discord bot, without any complexity.',
    templatesLabel: 'Templates',
    templatesTitle: '100+ Ready Templates',
    templatesDesc: 'Browse a growing library of pre-built workflows. Moderation, welcome systems, ticket bots, and more.',
    tplModeration: 'Moderation',
    tplWelcome: 'Welcome',
    tplTickets: 'Tickets',
    tplAutoRole: 'Auto-role',
    communityLabel: 'Community',
    communityTitle: 'Join Our Community',
    communityDesc: 'Share workflows, get help, and collaborate with thousands of fellow bot creators.',
    communityMembers: '4,200+ members',
    joinDiscord: 'Join Discord',
    previewLabel: 'Live Preview',
    previewTitle: 'Ask DisFlow...',
    previewChat1: 'I can help you build any bot workflow. Just describe what you need!',
    previewChat2: 'Welcome workflow configured!',
    previewPlaceholder: 'Type a command...',
    advantagesLabel: 'Advantages',
    advantagesTitle: 'Built for performance and simplicity',
    kb1Title: 'Zero Code Required',
    kb1Desc: 'Build complex bots with a visual drag & drop interface. No programming knowledge needed.',
    kb2Title: 'Instant Deployment',
    kb2Desc: 'One click to deploy. Your bot goes live immediately inside an isolated Docker container.',
    kb3Title: '99.9% Uptime',
    kb3Desc: 'Enterprise-grade infrastructure ensures your bots stay online around the clock.',
    kb4Title: 'Scale Without Limits',
    kb4Desc: 'From a single server to thousands ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ DisFlow scales automatically with your community.',
    testimonialsLabel: 'Testimonials',
    testimonialsTitle: 'See what people are saying',
    test1Quote: 'DisFlow transformed how we manage our Discord community. We built our entire moderation system without writing a single line of code.',
    test1Name: 'Alex R.',
    test1Role: 'Community Manager',
    test2Quote: 'The visual workflow editor is incredibly intuitive. I had a welcome bot and auto-role system running within minutes.',
    test2Name: 'Sarah K.',
    test2Role: 'Server Owner',
    test3Quote: 'As a developer, I appreciate the power under the hood. Full DiscordJS v14 access through a visual interface ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ brilliant.',
    test3Name: 'Marcus T.',
    test3Role: 'Developer',
    test4Quote: 'We replaced three separate bots with one DisFlow workflow. Easier to maintain, easier to scale, and way more reliable.',
    test4Name: 'Julien P.',
    test4Role: 'Startup Founder',
    pricingLabel: 'Pricing',
    pricingTitle: 'Choose the right plan for your goals',
    pricingSub: 'Pick the plan that fits your needs today and scales with your community.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    planFree: 'Free',
    planPro: 'Pro',
    planBusiness: 'Business',
    planSuffix: 'Plan',
    cancelAnytime: 'Cancel anytime.',
    priceFeat1Bot: '1 Bot instance',
    priceFeatBasicLib: 'Basic node library',
    priceFeat100Exec: '100 executions/day',
    priceFeatCommunity: 'Community support',
    priceFeatStdLogs: 'Standard logs',
    priceFeat5Bots: '5 Bot instances',
    priceFeatFullLib: 'Full node library',
    priceFeatUnlimited: 'Unlimited executions',
    priceFeatPriority: 'Priority support',
    priceFeatAnalytics: 'Advanced analytics',
    priceFeatUnlimitedBots: 'Unlimited bots',
    priceFeatEverythingPro: 'Everything in Pro',
    priceFeatTeam: 'Team collaboration',
    priceFeatAdmin: 'Admin dashboard',
    priceFeatApi: 'API access & webhooks',
    billedYearly: '/mo billed yearly',
    faqLabel: 'FAQ',
    faqTitle: 'Frequently asked questions',
    faq1Q: 'What is DisFlow?',
    faq1A: 'DisFlow is a no-code platform that lets you build, deploy, and manage Discord bots using a visual drag-and-drop workflow editor ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ no programming required.',
    faq2Q: 'Do I need coding knowledge?',
    faq2A: 'Not at all. DisFlow provides a complete visual interface with pre-built nodes for all Discord actions. If you can use a flowchart, you can build a bot.',
    faq3Q: 'How does deployment work?',
    faq3A: 'Each bot runs in its own isolated Docker container. When you click Deploy, your workflow is bundled and launched automatically ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ the whole process takes under 30 seconds.',
    faq4Q: 'Is my bot data secure?',
    faq4A: 'Yes. All tokens are encrypted at rest, each bot container is fully isolated, and we follow strict security practices. Your data is never shared or exposed.',
    faq5Q: 'Can I collaborate with my team?',
    faq5A: 'Absolutely. Team plans include real-time collaboration, shared workspaces, role-based permissions, and a centralized admin dashboard.',
    faq6Q: 'What Discord features are supported?',
    faq6A: 'DisFlow covers the complete DiscordJS v14 API ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ messages, embeds, reactions, roles, moderation, slash commands, modals, buttons, select menus, voice events, and much more.',
    previewBotName: 'My Moderation Bot',
    previewSave: 'Save',
    previewDeploy: 'Deploy',
    previewAddNode: 'Add Node',
    previewSearchNodes: 'Search nodes...',
    nodeCoreBot: 'Core Bot',
    nodeCommand: 'Command',
    nodeCondition: 'Condition',
    nodeEvent: 'Event',
    nodeSendMsg: 'Send Msg',
    nodeKick: 'Kick',
    nodeTrue: 'True',
    nodeFalse: 'False',
    catHandlers: 'Handlers',
    catHandlersDesc: 'Slash command or Discord event',
    catBot: 'Bot',
    catBotDesc: 'Bot presence, avatar and nickname',
    catActions: 'Actions',
    catActionsDesc: 'Send, edit or delete messages',
    catUsers: 'Users',
    catUsersDesc: 'DMs and user management',
    catInteractions: 'Interactions',
    catInteractionsDesc: 'Buttons, dropdowns and modals',
    catGuild: 'Guild',
    catGuildDesc: 'Roles, channels, threads and reactions',
    catVoice: 'Voice',
    catVoiceDesc: 'Voice channels and audio playback',
    catModeration: 'Moderation',
    catModerationDesc: 'Kick, ban and timeout',
    catCanvas: 'Canvas',
    catCanvasDesc: 'Images and graphic cards',
    catDatabase: 'Database',
    catDatabaseDesc: 'Read and write to database',
    catLogic: 'Logic',
    catLogicDesc: 'Conditions, loops and variables',
    catCoreBotDesc: 'Root node of the workflow',
    footerDesc: 'Build powerful Discord bots without writing code. Visual workflows, instant deployment, total control.',
    footerNav: 'Navigation',
    footerPages: 'Pages',
    footerSocials: 'Socials',
    footerHome: 'Home',
  },

  workflow: {
    loadingWorkflow: 'Loading workflow?',
    workflowNamePlaceholder: 'Workflow name?',
    unsavedChanges: 'Unsaved changes',
    descriptionPlaceholder: 'Description (optional)?',
    save: 'Save',
    deploy: 'Deploy',
    instancesBreadcrumb: 'Instances',
    aiModified: 'Workflow modified by AI',
    aiReverted: 'AI modification reverted',
    templateInserted: 'Template inserted',
    enterWorkflowName: 'Please enter a workflow name',
    workflowSaved: 'Workflow saved successfully!',
    loadFailed: 'Failed to load workflow',
    saveFailed: 'Failed to save workflow',
    deployFailed: 'Failed to deploy workflow',
    savedRebuilding: 'Workflow saved ? bot is rebuilding and will restart shortly (~30s).',
    noBotLinked: 'Workflow saved. No bot is linked yet ? assign it from the Dashboard.',
    deploySuccess: 'Workflow deployed successfully!',
    collaboratorsOnline: 'online',
    remoteUserSaved: 'A collaborator saved the workflow.',
    iaChat: 'AI Chat',
    console: 'Console',
    chat: 'Chat',
    split: 'Split',
    topBottom: 'Top & Bottom',
    leftRight: 'Left & Right',
    lines: 'lines',
    clear: 'Clear',
    waitingLogs: 'Waiting for bot logs?',
    openNodes: 'Open nodes',
    collapse: 'Collapse',
    addNode: 'Add a node',
    searchNodesPlaceholder: 'Search nodes...',
    nodeCount: 'nodes',
    noResults: 'No results for',
    dragOrClick: 'Drag or click to add',
    workflowTitle: 'Workflow',
    expand: 'Expand',
    languages: 'Languages',
    themes: 'Themes',
    canvas: 'Canvas',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    accentLabel: 'Accent:',
    snapToGrid: 'Snap to Grid',
    snapToGridHint: 'Align to grid',
    minimap: 'Minimap',
    minimapHint: 'Miniature view at bottom right',
    autoSave: 'Auto-Save',
    autoSaveHint: 'Auto-save (30s)',
    notifications: 'Notifications',
    saveNotif: 'Save',
    errors: 'Errors',
    browserNotif: 'Browser',
    browserNotifHint: 'System notifications',
    preferences: 'Preferences',
    confirmDelete: 'Confirm delete',
    confirmDeleteHint: 'Ask before deleting',
    tooltips: 'Tooltips',
    tooltipsHint: 'Show help tooltips',
    compactNodes: 'Compact nodes',
    compactNodesHint: 'Reduce node size',
    settings: 'Settings',
    help: 'Help',
    helpDesc: 'Guides and documentation',
    gettingStarted: 'Getting Started',
    canvasBasics: 'Canvas basics',
    addHandler: 'Add a handler',
    connectNodes: 'Connect nodes',
    handlers: 'Handlers',
    commandHandler: 'Command Handler',
    eventHandler: 'Event Handler',
    permissionsRoles: 'Permissions & roles',
    discordActions: 'Discord Actions',
    messagesEmbeds: 'Messages & embeds',
    roleManagement: 'Role management',
    moderation: 'Moderation',
    database: 'Database',
    sqlQuery: 'SQL Query',
    createTableHelp: 'CREATE TABLE',
    selectInsert: 'SELECT / INSERT',
    templates: 'Templates',
    templatesDesc: 'Workflow library',
    searchPlaceholder: 'Search?',
    all: 'All',
    insert: 'Insert',
    noTemplateFound: 'No template found',
    databases: 'Databases',
    databasesDesc: 'Manage your SQL tables',
    members: 'Members',
    membersDesc: 'Workflow collaborators',
    settingsDesc: 'Snap, minimap, auto-save?',
    // Category descriptions
    catHandlersDesc: 'Trigger your workflow from a slash command or a Discord event',
    catBotDesc: 'Manage the bot presence, avatar and nickname',
    catActionsDesc: 'Send, edit or delete messages in channels',
    catUsersDesc: 'Private messages, user info and user management',
    catInteractionsDesc: 'Buttons, dropdowns, modals and interaction handlers',
    catGuildDesc: 'Roles, channels, threads, reactions, pins and invites',
    catVoiceDesc: 'Voice channels, audio playback and connected member management',
    catModsDesc: 'Kick, ban, timeout and nickname management',
    catCanvasDesc: 'Generate images and custom graphic cards',
    catDatabaseDesc: 'Read and write to a SQL database',
    catLogicDesc: 'Conditions, loops, variables, transformations, HTTP and webhooks',
    catCoreDesc: 'Root node of the workflow ? configure your Discord bot',
    catModsLabel: 'Moderation',
    // Node descriptions
    nodeDescCoreBot: 'The starting point of your workflow',
    nodeDescCondition: 'Branch based on a condition',
    nodeDescDelay: 'Wait for a specified time',
    nodeDescVariable: 'Store or retrieve variables',
    nodeDescForEach: 'Iterate over each item in a list',
    nodeDescSwitchCase: 'Branch execution across multiple cases',
    nodeDescRandom: 'Generate a random value or pick a random item',
    nodeDescCounter: 'Increment or decrement a counter value',
    nodeDescFilter: 'Filter items in a list based on a condition',
    nodeDescMathOperation: 'Perform arithmetic operations on values',
    nodeDescStringOperation: 'Manipulate text strings (uppercase, trim, replace?)',
    nodeDescArrayOperation: 'Manipulate arrays: push, pop, join, sort, slice?',
    nodeDescJsonParse: 'Parse a JSON string into a variable',
    nodeDescJsonStringify: 'Convert a variable to a JSON string',
    nodeDescTypeConvert: 'Convert a value between types (string, number, boolean?)',
    nodeDescGetDate: 'Get the current date and time into variables',
    nodeDescLoopWhile: 'Repeat while a condition is true (max 100 iterations)',
    nodeDescHttpRequest: 'Make an HTTP request',
    nodeDescWebhook: 'Create a webhook endpoint',
    nodeDescSendMessage: 'Send a message (text, rich embed, image, file) in a channel',
    nodeDescEditMessage: 'Edit the content of an existing message',
    nodeDescDeleteMessage: 'Delete a message from a channel',
    nodeDescReplyToMessage: 'Reply to an existing message',
    nodeDescAddRole: 'Add a role to a member',
    nodeDescRemoveRole: 'Remove a role from a member',
    nodeDescCreateRole: 'Create a new role',
    nodeDescKick: 'Kick a member from the server',
    nodeDescBan: 'Ban a member from the server',
    nodeDescUnban: 'Remove a ban from a user',
    nodeDescTimeout: 'Temporarily mute a member for a duration',
    nodeDescUnmute: 'Remove timeout from a member (unmute before expiry)',
    nodeDescBulkDeleteMessages: 'Bulk delete recent messages in a channel (max 100, < 14 days)',
    nodeDescSetNickname: 'Change a member server nickname',
    nodeDescCreateChannel: 'Create a new text or voice channel',
    nodeDescDeleteChannel: 'Permanently delete a channel',
    nodeDescCommandHandlerSuite: 'Register and execute Discord slash commands',
    nodeDescEventHandlerSuite: 'Trigger workflows on Discord events',
    nodeDescSqlDatabase: 'Execute a SQL query on the instance database',
    nodeDescCodeExec: 'Run custom JavaScript code with Discord context access',
    nodeDescCanvasCard: 'Generate an image (profile card, banner?) via a visual layer builder',
    nodeDescJoinVoiceChannel: 'Connect the bot to a voice channel',
    nodeDescLeaveVoiceChannel: 'Disconnect the bot from the current voice channel',
    nodeDescPlayAudio: 'Play an audio file (YouTube, MP3, OGG) in the voice channel',
    nodeDescStopAudio: 'Stop the current audio playback',
    nodeDescMoveToVoice: 'Move a member to a voice channel',
    nodeDescDisconnectFromVoice: 'Disconnect a member from the voice channel',
    nodeDescSetBotPresence: 'Change the bot status and activity (fixed or rotating)',
    nodeDescSetBotNickname: 'Change the bot nickname in the server',
    nodeDescSetBotAvatar: 'Change the bot global avatar',
    nodeDescSendDM: 'Send a private message to a user',
    nodeDescAddReaction: 'Add an emoji reaction to a message',
    nodeDescPinMessage: 'Pin a message in a channel',
    nodeDescUnpinMessage: 'Unpin a message in a channel',
    nodeDescCreateThread: 'Create a thread from a message or channel',
    nodeDescArchiveThread: 'Archive or close a thread',
    nodeDescEditChannel: 'Edit a channel name, topic or slowmode',
    nodeDescCreateInvite: 'Generate an invite link for a channel',
    nodeDescEditGuild: 'Edit server settings (name, icon, banner, description?)',
    nodeDescEditRole: 'Edit role properties (name, color, permissions, position?)',
    nodeDescDeleteRole: 'Permanently delete a role from the server',
    nodeDescCreateEmoji: 'Create a custom emoji from an image URL',
    nodeDescDeleteEmoji: 'Delete a custom emoji from the server',
    nodeDescEditEmoji: 'Rename an emoji or change its allowed roles',
    nodeDescCreateSticker: 'Create a custom sticker from an image or Lottie file',
    nodeDescDeleteSticker: 'Delete a sticker from the server',
    nodeDescCreateEvent: 'Create a scheduled event in the server',
    nodeDescEditEvent: 'Edit a scheduled event (title, description, date, image?)',
    nodeDescDeleteEvent: 'Cancel and delete a scheduled event',
    nodeDescCreateGuildWebhook: 'Create a webhook in a server channel',
    nodeDescDeleteGuildWebhook: 'Delete a webhook from the server',
    nodeDescExecuteWebhook: 'Send a message via a Discord webhook (text, embed, file)',
    nodeDescFetchAuditLog: 'Fetch the server audit log entries',
    nodeDescFetchMembers: 'Fetch the server member list with optional filters',
    nodeDescServerMuteMember: 'Server mute a member in voice',
    nodeDescServerDeafenMember: 'Server deafen a member in voice',
    nodeDescFetchUserInfo: 'Fetch user info and store them in variables',
    nodeDescSendButtons: 'Send a message with clickable buttons',
    nodeDescSendStringSelectMenu: 'Send a dropdown menu with text options',
    nodeDescSendUserSelectMenu: 'Send a user selector',
    nodeDescSendRoleSelectMenu: 'Send a role selector',
    nodeDescSendChannelSelectMenu: 'Send a channel selector',
    nodeDescSendModal: 'Display a modal window with form fields',
    nodeDescAwaitButtonClick: 'Wait for a button click with a timeout',
    nodeDescAwaitSelectMenu: 'Wait for a dropdown selection with timeout',
    nodeDescButtonInteractionHandler: 'Trigger workflow when a matching button is clicked',
    nodeDescSelectMenuInteractionHandler: 'Trigger workflow when a menu option is selected',
    nodeDescModalSubmitHandler: 'Trigger workflow when a modal form is submitted',
    // Template category labels
    tplCatModeration: 'Moderation',
    tplCatUser: 'User',
    tplCatServer: 'Server',
    tplCatUtility: 'Utility',
    // Template names & descriptions
    tplModBanName: '/ban ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Ban a member',
    tplModBanDesc: 'Slash command that bans a member with an optional reason, then confirms in the channel.',
    tplModKickName: '/kick ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Kick a member',
    tplModKickDesc: 'Kicks a member from the server. The member can rejoin via invite.',
    tplModTimeoutName: '/timeout ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Timeout a member',
    tplModTimeoutDesc: 'Times out a member for a defined duration (in minutes).',
    tplModUnmuteName: '/unmute ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Remove timeout',
    tplModUnmuteDesc: 'Removes the timeout from a member before the duration ends.',
    tplModWarnName: '/warn ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Warn via DM',
    tplModWarnDesc: 'Sends a warning via direct message to the member, then confirms in the channel.',
    tplModClearName: '/clear ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Delete messages',
    tplModClearDesc: 'Bulk-deletes up to 100 messages in the current channel.',
    tplModUnbanName: '/unban ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Unban a member',
    tplModUnbanDesc: 'Removes a ban by Discord ID.',
    tplUserInfoName: '/userinfo ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Member info',
    tplUserInfoDesc: 'Displays information about a member (nickname, roles, join dateÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½).',
    tplUserNickName: '/nick ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Change nickname',
    tplUserNickDesc: 'Changes a member\u0027s nickname on the server.',
    tplUserAddroleName: '/addrole ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Add a role',
    tplUserAddroleDesc: 'Assigns a role to a member.',
    tplUserRemroleName: '/remrole ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Remove a role',
    tplUserRemroleDesc: 'Removes a role from a member.',
    tplSrvServerinfoName: '/serverinfo ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Server info',
    tplSrvServerinfoDesc: 'Displays server statistics (members, creation date, etc.).',
    tplSrvInviteName: '/invite ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Create an invite',
    tplSrvInviteDesc: 'Generates an invite for the current channel and sends it as a reply.',
    tplSrvAutomodName: 'Auto-mod ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Word filter',
    tplSrvAutomodDesc: 'Listens to every message, checks a filter condition, and deletes the message if needed.',
    tplUtilPingName: '/ping ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Bot latency',
    tplUtilPingDesc: 'Replies with the bot and Discord API latency.',
    tplUtilRollName: '/roll ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Roll a die',
    tplUtilRollDesc: 'Rolls an N-sided die and displays the random result.',
    tplUtilChooseName: '/choose ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¿ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â½ Choose at random',
    tplUtilChooseDesc: 'Randomly picks an option from a comma-separated list.',
    tplUtilDelayMsgName: 'Delayed message',
    tplUtilDelayMsgDesc: 'Sends a first message immediately, waits X seconds, then sends a follow-up message.',
    shortcutSave: 'Save',
    shortcutUndo: 'Undo',
    shortcutRedo: 'Redo',
    shortcutSelectAll: 'Select all',
    shortcutCopy: 'Copy',
    shortcutPaste: 'Paste',
    shortcutCut: 'Cut',
    shortcutDuplicate: 'Duplicate',
    shortcutDelete: 'Delete selection',
    shortcutPan: 'Pan canvas',
    shortcutSelection: 'Rectangle selection',
    shortcutMultiSelect: 'Multi-select',
    keyboardShortcuts: 'Keyboard shortcuts',
    exportWorkflow: 'Export',
    importWorkflow: 'Import',
    exportSuccess: 'Workflow exported successfully!',
    importSuccess: 'Workflow imported successfully!',
    importError: 'Error importing workflow',
    importInvalidJson: 'The selected file is not valid JSON.',
    importInvalidFormat: 'Invalid workflow format.',
  },

  nodeConfig: {
    saveBtn: 'Save',
    closeBtn: 'Close',
    name: 'Name',
    operation: 'Operation',
    value: 'Value',
    storeResultIn: 'Store result in',
    noteOptional: 'Note (optional ? markdown supported)',
    noteDesc: 'Describe what this node does?',
    accessVia: 'Access via',
    lastExecution: 'Last execution',
    arguments_: 'Arguments',
    user: 'User',
    server: 'Server',
    channel: 'Channel',
    message: 'Message',
    runtimeVars: 'Runtime variables',
    bgColor: 'Background color',
    addNotesHint: 'Add notes above to see the preview.',
    canvasPreview: 'Canvas preview',
    output: 'Output',
    define: '?? Define',
    deleteOp: '??? Delete',
    currentChannel: 'Current channel',
    custom: 'Custom',
    directId: 'Direct ID',
    fromDatabase: 'Database',
    fetchChannelIdFromDb: 'Fetch channel_id from DB',
    refreshBtn: 'Refresh',
    noBotAssociated: 'No bot associated',
    dbInaccessible: 'Database inaccessible',
    table: 'Table',
    selectTable: 'Select a table',
    selectColumn: 'Select a column',
    columnChannelId: 'Column containing the Channel ID',
    whereConditions: 'WHERE conditions',
    voiceChannel: 'Voice channel',
    userChannel: 'User\'s channel',
    idVariable: 'ID / Variable',
    autoVoiceHint: 'The bot automatically joins the user\'s voice channel.',
    noInputData: 'No input data',
    connectUpstream: 'Connect an upstream node',
    availableData: 'Available data',
    notExecutedYet: 'Not executed yet',
    noFieldsAvailable: 'No fields available',
    executeWorkflow: 'Execute the workflow to see available data',
    context: 'Context',
    discordCommonVars: 'Common Discord variables',
    dragOrClickVar: 'Drag into a field or click.',
    edit: 'Edit',
    preview: 'Preview',
    markdown: 'Markdown',
    markdownDiscord: 'Discord Markdown',
    discordPreview: 'Discord Preview',
    fillFieldsPreview: 'Fill in the fields to see the preview',
    codeNodeJs: 'Node.js Code',
    equals: 'equals (==)',
    notEquals: 'not equal to (!=)',
    greaterThan: 'greater than (>)',
    lessThan: 'less than (<)',
    greaterOrEqual: 'greater or equal (>=)',
    lessOrEqual: 'less or equal (<=)',
    contains: 'contains',
    notContains: 'does not contain',
    startsWith: 'starts with',
    endsWith: 'ends with',
    matchesRegex: 'matches regex',
    operator: 'Operator',
    rightValue: 'Right value',
    duration: 'Duration',
    unit: 'Unit',
    milliseconds: 'Milliseconds',
    seconds: 'Seconds',
    minutes: 'Minutes',
    hours: 'Hours',
    increment: 'Increment',
    decrement: 'Decrement',
    reset: 'Reset',
    valueToTest: 'Value to test',
    case_: 'Case',
    addCase: 'Add a case',
    forEach: 'For each element',
    sourceVariable: 'Source variable',
    currentElementVar: 'Current element variable',
    currentElementValue: 'Current element value in?',
    loopCondition: 'Loop condition',
    leftValue: 'Left value',
    maxIterations: 'Max iterations',
    usageWarning: '?? Usage',
    loopInstructions: 'Connect the Loop output to the block to repeat? The Done output continues when the condition is false or max is reached.',
    filterList: 'Filter a list',
    propertyToTest: 'Property to test',
    emptyTestElement: '(empty = test element itself)',
    comparisonValue: 'Comparison value',
    storeMatchesIn: 'Store matches in',
    sourceText: 'Source text',
    caseGroup: 'Case',
    spacesGroup: 'Spaces',
    manipulationGroup: 'Manipulation',
    infoGroup: 'Information',
    uppercase: 'UPPERCASE',
    lowercase: 'lowercase',
    trimBoth: 'Trim (both)',
    trimStart: 'Trim start',
    trimEnd: 'Trim end',
    replaceAll: 'Replace all',
    replaceFirst: 'Replace first',
    splitOp: 'Split',
    sliceOp: 'Slice',
    reverse: 'Reverse',
    repeat: 'Repeat',
    padStart: 'Pad start',
    padEnd: 'Pad end',
    length: 'Length',
    containsQ: 'Contains?',
    startsWithQ: 'Starts with?',
    endsWithQ: 'Ends with?',
    indexOf: 'Index of',
    search: 'Search',
    searchValue: 'Value to search',
    replaceWith: 'Replace with',
    separator: 'Separator',
    startIndex: 'Start (index)',
    endExcluded: 'End (excluded, empty = end)',
    targetLength: 'Target length',
    repeatCount: 'Repeat count',
    fillCharacter: 'Fill character',
    storeInVariable: 'Store in variable',
    sourceArray: 'Source array',
    arrayVariable: 'Array variable',
    arrayVariableHint: 'Variable containing a JSON array.',
    addRemoveGroup: 'Add / Remove',
    searchGroup: 'Search',
    infoArrayGroup: 'Information',
    sortGroup: 'Sort',
    push: 'Push (add to end)',
    pop: 'Pop (remove last)',
    unshift: 'Unshift (add to start)',
    shift: 'Shift (remove first)',
    clearArray: 'Clear array',
    containsValue: 'Contains value?',
    indexOfValue: 'Index of value',
    join: 'Join',
    sliceArray: 'Slice',
    sort: 'Sort',
    reverseArray: 'Reverse',
    jsonToParse: 'JSON to parse',
    jsonSource: 'JSON source',
    flattenKeys: 'Flatten keys',
    parseErrorHint: 'On parsing error, the Error output is followed.',
    jsonSourceVar: 'Source variable',
    serializeHint: 'The content of this variable will be serialized to JSON.',
    indentation: 'Indentation (0 = compact)',
    typeConversion: 'Type conversion',
    sourceValue: 'Source value',
    targetType: 'Target type',
    behaviors: 'Behaviors',
    dateTimeCurrent: 'Current Date & Time',
    variablePrefix: 'Variable prefix',
    variablesCreated: 'Variables created:',
    dateShort: 'short date + time',
    timestamp: 'timestamp (ms)',
    iso8601: 'ISO 8601',
    components: 'components',
    time: 'time',
    timezone: 'Timezone',
    customFormat: 'Custom format',
    destination: 'Destination',
    text: 'Text',
    content: 'Content',
    ephemeral: 'Ephemeral',
    ephemeralHint: 'Visible only to the user',
    richEmbed: 'Rich embed',
    enabled: 'Enabled',
    title: 'Title',
    embedTitlePlaceholder: 'Embed title',
    description: 'Description',
    bodyTextPlaceholder: 'Body text?',
    color: 'Color',
    author: 'Author',
    authorNamePlaceholder: 'Author name',
    authorIcon: 'Author icon',
    footer: 'Footer',
    footerTextPlaceholder: 'Footer text',
    imageUrl: 'Image URL',
    thumbnailUrl: 'Thumbnail URL',
    fields: 'Fields',
    fieldNamePlaceholder: 'Field name',
    fieldValuePlaceholder: 'Field value',
    addField: 'Add a field',
    imageUrlLabel: 'Image URL',
    caption: 'Caption',
    captionOptional: 'Optional caption',
    spoiler: 'Spoiler',
    spoilerHideImage: 'Hides the image behind a spoiler tag.',
    attachment: 'File attachment',
    fileUrl: 'File URL',
    fileName: 'File name',
    altDescription: 'Alt text / description',
    spoilerHideFile: 'Hides the file behind a spoiler tag.',
    botJoinsMuted: 'The bot joins the channel muted.',
    botJoinsDeaf: 'The bot joins the channel deafened (recommended if not vocal).',
    disconnectBot: 'Disconnects the bot from the voice channel it currently occupies.',
    audioSource: 'Audio source',
    urlDirect: 'Direct URL (MP3, OGG?)',
    youtube: 'YouTube (URL or ID)',
    variableBuffer: 'Variable (buffer)',
    volume: 'Volume (0?200%)',
    waitEnd: 'Wait for end',
    waitEndHint: 'The workflow waits for the track to finish before continuing.',
    stopPlayback: 'Immediately stops the current audio playback in the bot\'s voice channel.',
    member: 'Member',
    destChannel: 'Destination channel',
    status: 'Status',
    statusOnline: '?? Online',
    statusIdle: '?? Idle',
    statusDnd: '? Do Not Disturb',
    statusInvisible: '? Invisible',
    activity: 'Activity',
    activityText: 'Activity text',
    streamUrl: 'Stream URL (Twitch/YouTube)',
    rotationOptional: 'Rotation (optional)',
    rotationHint: 'Add a list of activities separated by line breaks. The bot will rotate between them.',
    rotationActivities: 'Rotation activities',
    rotationPlaceholder: 'playing workflows\nwatching the server\nlistening to events',
    rotationInterval: 'Rotation interval (seconds)',
    serverNickname: 'Server nickname',
    newNickname: 'New nickname',
    emptyToReset: 'Leave empty to reset',
    globalAvatar: 'Bot global avatar',
    avatarUrl: 'URL or base64 image',
    avatarLimitHint: 'Discord avatar can only be changed twice per hour.',
    recipient: 'Recipient',
    targetMessage: 'Target message',
    emoji: 'Emoji',
    emojiHint: 'Unicode emoji (e.g. ??) or custom server emoji',
    thread: 'Thread',
    source: 'Source',
    fromChannel: 'From a channel (forum/text)',
    fromMessage: 'From a message',
    autoArchive: 'Auto-archive (minutes)',
    oneHour: '1 hour',
    twentyFourHours: '24 hours',
    threeDays: '3 days',
    oneWeek: '1 week',
    privateThread: 'Private thread',
    privateThreadHint: 'Only invited members can see this thread.',
    threadToArchive: 'Thread ID to archive',
    lock: 'Lock',
    lockHint: 'Locks the thread (only moderators can reopen).',
    channelToEdit: 'Channel to edit',
    modifications: 'Modifications',
    newName: 'New name',
    leaveEmptyNoChange: 'Leave empty to keep unchanged',
    newTopic: 'New topic',
    slowmode: 'Slowmode (seconds, 0 = disabled)',
    sourceChannel: 'Source channel',
    durationSeconds: 'Duration (seconds, 0 = unlimited)',
    maxUses: 'Max uses (0 = unlimited)',
    unique: 'Unique',
    uniqueHint: 'Always generates a new unique link.',
    storeLinkIn: 'Store link in variable',
    muteLabel: 'Mute',
    deafenLabel: 'Deafen',
    disableMuteHint: 'Disable to remove mute.',
    disableDeafenHint: 'Disable to remove deafen.',
    userToFetch: 'User to fetch',
    includeMemberData: 'Include member data',
    includeMemberDataHint: 'Also fetches nickname, roles and server join date.',
    messageContent: 'Message content',
    chooseOption: 'Choose an option:',
    reply: 'Reply',
    replyToInteraction: 'Reply to current interaction',
    buttons: 'Buttons',
    buttonN: 'Button',
    label: 'Label *',
    clickHere: 'Click here',
    addButton: 'Add a button',
    makeYourChoice: 'Make your choice:',
    placeholder: 'Placeholder',
    chooseAnOption: 'Choose an option...',
    minChoices: 'Min choices',
    maxChoices: 'Max choices',
    options: 'Options',
    optionN: 'Option',
    default_: 'Default',
    shortDescPlaceholder: 'Short description',
    addOption: 'Add an option',
    users: 'users',
    roles: 'roles',
    channels: 'channels',
    selectItems: 'Select',
    chooseItems: 'Choose',
    resultVariable: 'Result variable',
    modal: 'Modal',
    titleRequired: 'Title *',
    formPlaceholder: 'Contact form',
    modalWarning: '?? Modals can only be shown in response to an interaction (button, command, menu).',
    modalFields: 'Fields',
    fieldN: 'Field',
    labelRequired: 'Label *',
    yourMessage: 'Your message',
    shortOneLine: 'Short (1 line)',
    paragraph: 'Paragraph',
    enterPlaceholder: 'Enter...',
    required: 'Required',
    addFieldBtn: 'Add a field',
    interactionHandler: '?? Interaction Handler',
    interactionDesc: 'Triggers your workflow every time a matching {type} is activated.',
    button: 'button',
    selectMenu: 'select menu',
    linkToNode: 'Link to a workflow node',
    reactiveButton: 'Reactive button',
    customIdApplied: '? Custom ID ? automatically applied.',
    activeCustomId: 'Active Custom ID',
    manualCustomId: '?? Enter a Custom ID manually',
    customIdFilter: 'Custom ID filter',
    matchType: 'Match type',
    startsWithPrefix: 'Starts with (prefix)',
    exactlyEquals: 'Exactly equals',
    containsMatch: 'Contains',
    regex: 'Regex',
    backToBuilder: '? Back to visual builder',
    interactionVariable: 'Interaction variable',
    customIdUniqueHint: '(unique, used to listen for clicks)',
    customIdSubmissionHint: '(to listen for submission)',
    request: 'Request',
    method: 'Method',
    headersJson: 'Headers (JSON)',
    responseVariable: 'Response variable',
    storesResponseBody: 'Stores the response body.',
    webhookSourceNode: '?? Webhook source node',
    webhookDesc: 'This node starts the workflow when an incoming HTTP call is received on the webhook URL generated by your instance.',
    receiveVariable: 'Receive variable',
    receiveHint: 'The incoming POST body will be stored in this variable.',
    target: 'Target',
    userId: 'User ID',
    reason: 'Reason',
    timeoutEndedEarly: 'Timeout ended early',
    messageCount: 'Message count (1?100)',
    discordIgnoresOld: 'Discord ignores messages older than 14 days.',
    deletedCountVar: 'Variable ? deleted count',
    serverSettings: 'Server settings',
    auditReason: 'Audit reason',
    autoUpdate: 'Automatic update',
    role: 'Role',
    roleId: 'Role ID',
    displaySeparately: 'Display separately',
    mentionable: 'Mentionable',
    autoModification: 'Automatic modification',
    roleToDelete: 'Role to delete',
    autoDeletion: 'Automatic deletion',
    createdIdVar: 'Variable ? created ID',
    emojiId: 'Emoji ID',
    newNameLabel: 'New name',
    stickerDescription: 'Sticker description',
    emojiTag: 'Emoji tag (e.g. ??)',
    fileUrlLabel: 'File URL',
    stickerToDelete: 'Sticker to delete',
    stickerId: 'Sticker ID',
    details: 'Details',
    eventDescription: 'Optional event description',
    locationType: 'Location type',
    externalLocation: 'External (text location)',
    voiceChannelType: 'Voice channel',
    stageType: 'Stage',
    voiceChannelId: 'Voice channel ID',
    locationText: 'Location (text)',
    locationPlaceholder: 'Discord Voice / Online',
    startIso: 'Start (ISO 8601)',
    endIso: 'End (ISO 8601, optional)',
    coverImage: 'Cover image (URL)',
    eventToDelete: 'Event to delete',
    eventId: 'Event ID',
    targetChannel: 'Target channel',
    webhookName: 'Webhook name',
    avatarOptional: 'Avatar (URL, optional)',
    webhookUrlVar: 'Variable ? webhook URL',
    webhookIdVar: 'Variable ? webhook ID',
    webhookToDelete: 'Webhook to delete',
    webhookId: 'Webhook ID',
    webhookUrlRequired: 'Webhook URL *',
    useCreateWebhookVar: 'Use the Create Webhook node variable',
    messageContentPlaceholder: 'Message content...',
    fileAttachment: 'File / Attachment',
    fileOrAttachmentUrl: 'File URL or path',
    publicUrlHint: 'Public URL or generated file variable (canvas card, etc.).',
    allActions: 'All actions',
    filterByUser: 'Filter by user (ID, optional)',
    actionType: 'Action type (optional)',
    searchUsername: 'Search (partial username, optional)',
    limit: 'Limit (max 1000)',
    square: 'Square (512)',
    background: 'Background',
    textLayer: 'Text',
    imageAvatar: 'Image / Avatar',
    rectangleLayer: 'Rectangle',
    progressBar: 'Progress bar',
    circleEllipse: 'Circle / Ellipse',
    lineLayer: 'Line',
    badge: 'Badge (text+bg)',
    style: '?? Style',
    position: '?? Position',
    shadow: '?? Shadow',
    opacity: 'Opacity',
    solid: '?? Solid',
    gradient: '?? Gradient',
    imageType: '??? Image',
    colorLabel: 'Color',
    from: 'From',
    to: 'To',
    direction: 'Direction',
    sizePx: 'Size (px)',
    weight: 'Weight',
    textColor: 'Text color',
    alignment: 'Alignment',
    badgeBg: 'Badge background',
    cornerRadius: 'Corner radius',
    paddingX: 'Padding X',
    paddingY: 'Padding Y',
    circularCrop: 'Circular crop',
    bgColor2: 'Background color',
    border: 'Border',
    borderThickness: 'Border thickness',
    radiusPx: 'Radius (px)',
    thicknessPx: 'Thickness (px)',
    endings: 'Endings',
    rounded: 'Rounded',
    straight: 'Straight',
    squareEnd: 'Square',
    barColor: 'Bar color',
    valueExpression: 'Value (expression)',
    maxValueLabel: 'Max value',
    blurPx: 'Blur (px)',
    offsetX: 'Offset X',
    offsetY: 'Offset Y',
    dimensions: 'Dimensions',
    widthPx: 'Width (px)',
    heightPx: 'Height (px)',
    centerX: 'Center X',
    centerY: 'Center Y',
    hide: 'Hide',
    show: 'Show',
    layers: 'Layers',
    noLayers: 'No layers ? add one below',
    moveUp: 'Move up',
    moveDown: 'Move down',
    duplicate: 'Duplicate',
    deleteLayer: 'Delete',
    addLayer: '+ Add a layer',
    bgLayerName: 'Background',
    rectLayerName: 'Rectangle',
    circleLayerName: 'Circle',
    lineLayerName: 'Line',
    textLayerName: 'Text',
    badgeLayerName: 'Badge',
    imageLayerName: 'Image',
    barLayerName: 'Bar',
    inSendImageNode: 'in a node',
    canvasCardSendHint: 'Sends the generated image in a channel without going through a Send Image node.',
    sendDirectToDiscord: 'Send directly to Discord',
    noBotAssociatedSql: 'No bot associated',
    noBotAssociatedSqlDesc: 'This workflow is not linked to any bot instance. Assign a bot from the Dashboard to use SQL queries.',
    dbNotFound: 'Database not found',
    dbNotFoundDesc: 'The bot does not have a database yet, or it is offline. Create one from the Database tab in the Dashboard.',
    createDatabase: 'Create a database',
    retryBtn: 'Retry',
    queryType: 'Query type',
    refreshTables: 'Refresh tables',
    noTables: 'No tables.',
    createFromDashboard: 'Create one from the Dashboard',
    allColumns: 'All columns',
    columnsLabel: 'Columns',
    loadingColumns: 'Loading columns?',
    whereConditionsSql: 'WHERE conditions',
    orderBy: 'Sort (ORDER BY)',
    dataToInsert: 'Data to insert',
    addValue: 'Add a value',
    binding: 'Binding:',
    columnPlaceholder: '? Column ?',
    addCondition: 'Add a condition',
    noConditionWarning: 'No condition ? all rows will be affected',
    addSort: 'Add sort',
    deleteAllWarning: 'If WHERE is empty, all rows in the table will be deleted.',
    sqlQueryTitle: 'SQL Query',
    unlimited: 'Unlimited',
    iconUrlBase64: 'Icon (URL or base64)',
    bannerUrl: 'Banner (URL)',
    verifiedMember: 'Verified member',
    backToVisualBuilder: 'Back to visual builder',
    codeExamplePlaceholder: '// Example\nconst score = ctx.variables.score ?? 0;\nreturn score + 1;',
// Code node context hints
    codeCtxPrefix: 'The context',
    codeCtxContains: 'contains',
    codeCtxUseReturn: 'Use',
    codeCtxForResult: 'for the result.',
    accessViaNextNodes: 'Access in following nodes via',
    // Condition hints
    regexHint: 'Enter a regular expression, e.g.',
    // Delay hints
    maxDelayWarning: '?? Maximum 5 minutes (300,000 ms) ? higher values are truncated.',
    // Switch hints
    switchDefaultPrefix: 'If no case matches, the output',
    switchDefaultSuffix: 'is used.',
    // ForEach hints
    contentOf: 'Content of',
    acceptsJsonArray: 'Accepts a JSON array',
    orCsvList: 'or a comma-separated list.',
    currentItemValueIn: 'Current element value in',
    // Filter hints
    jsonArrayOrCsvIn: 'JSON array or CSV list in',
    jsonArrayVarHint: 'Variable containing a JSON array.',
    // JSON/Variable labels
    variableName: 'Variable name',
    jsonSerializeHint: 'The content of this variable will be serialized as JSON.',
    indentCompact: 'Indentation (0 = compact)',
    // Date/Time
    dateTokensPrefix: 'Tokens:',
    dateTokensStoredIn: '? stored in',
    // Loop While
    loopUsageTitle: '?? Usage',
    loopConnectOutput: 'Connect the output',
    loopToRepeat: 'to the block to repeat, and loop it back to this node. The output',
    loopDoneOutput: 'Done',
    loopDoneContinues: 'continues when the condition is false or max is reached.',
    // Bot management
    activityRotationDesc: 'Add a list of activities separated by line breaks. The bot will rotate between them.',
    avatarRateLimitHint: 'The Discord avatar can only be changed 2 times per hour.',
    // Fetch User
    fetchUserCreates: 'Creates:',
    fetchUserEtc: ', etc.',
    // Select Menu
    selectOutputHint: 'will contain an array of selected items.',
    // Modal
    fieldsCount: 'Fields',
    // Await Button
    filterSectionTitle: 'Filter',
    buttonCustomId: 'Button Custom ID',
    optionalLabel: 'optional',
    optionalRestrictUser: 'optional ? restrict to 1 user',
    optionalMessage: 'optional',
    timeoutHintPrefix: 'If no click within this delay, the output',
    timeoutHintSuffix: 'is triggered.',
    storesHint: 'Stores:',
    // Await Select
    menuCustomId: 'Menu Custom ID',
    storesValuesArray: '(array) and',
    // HTTP
    httpResponsePrefix: 'Stores the response body. HTTP status is in',
    httpResponseSuffix: '.',
    webhookSourceTitle: '?? Webhook Source Node',
    webhookTriggerDesc: 'This node starts the workflow when an incoming HTTP call is received on the webhook URL generated by your instance.',
    postBodyHint: 'The incoming POST body will be stored in this variable.',
    // Send Image / Webhook Execute
    publicUrlOrVarHint: 'Public URL or generated file variable (canvas card, etc.).',
    waitLabel: 'Wait',
    waitHint: 'Wait for Discord confirmation (required to get the message ID)',
    outputVarLabel: 'Output variable',
    ifWaitActive: '(if Wait active)',
    // Audit Log
    auditLogJsonHint: 'JSON array of entries with',
    // Fetch Members
    fetchMembersJsonHint: 'JSON array with',
    // SQL panel extra
    goToDashboard: 'Go to Dashboard',
    createFromDashboardLink: 'Create one from the Dashboard',
    columnsTitle: 'Columns',
    loadingColumnsText: 'Loading columns?',
    loadingText: 'loading?',
    rawVarsInterpreted: 'Variables',
    rawVarsInterpretedSuffix: 'are interpreted before execution.',
    rootNode: 'Root node',
    executeToSeeOutput: 'Execute the workflow to see output data',
    connections: 'Connections',
    notConnected: 'Not connected',
    layerText: 'Text',
    layerImageAvatar: 'Image / Avatar',
    layerRectangle: 'Rectangle',
    layerProgressBar: 'Progress Bar',
    layerCircleEllipse: 'Circle / Ellipse',
    layerLine: 'Line',
    layerBadgeLabel: 'Badge (text+bg)',
    addBgLabel: 'Background',
    addCircleLabel: 'Circle',
    addLineLabel: 'Line',
    addTextLabel: 'Text',
    addBadgeLabel: 'Badge',
    addBarLabel: 'Bar',
    storeImageInVar: 'Store image in variable',
    layersHeader: 'Layers',
    bottomToTop: 'bottom ? top',
    noLayersHint: 'No layers ? add one below',
    outputLabel: 'Output:',
    storesPrefix: 'Stores',
    usesDynamicVars: 'Uses dynamic variables like',
    availableVia: 'Available via',
    objectAccessibleVia: 'The object will be accessible via',
    flattenHint: 'For an object {"a":1}, also maps variable.data.a ? 1.',
    parseErrorHintText: 'On parse error, the Error output is followed.',
    errorOutputLabel: 'Error',
    booleanHint: '"true", "1" or number > 0 ? true',
    integerHint: 'truncation (e.g. 3.9 ? 3)',
    numberHint: 'floating point',
    dateShortTime: 'short date + time',
    timestampMs: 'timestamp (ms)',
    componentsLabel: 'components',
    timeLabel: 'time',
    botJoinsMutedHint: 'The bot joins the channel muted.',
    currentlyOnServer: 'currently on the server.',
    inBotVoiceChannel: 'in the bot voice channel.',
    discordIgnoresOldMsg: 'Discord ignores messages older than 14 days.',
    useCreateWebhookVarHint: 'Use the variable from the Create Webhook node:',
    webhookRichEmbed: 'Rich Embed',
    webhookEnabled: 'Enabled',
    webhookTitle: 'Title',
    webhookDescription: 'Description',
    webhookColor: 'Color',
    webhookImageUrl: 'Image URL',
    webhookMiniatureUrl: 'Thumbnail URL',
    storesColon: 'Stores:',
    messageContentPh: 'Message content...',
    nomLabel: 'Name',
    descriptionLabel: 'Description',
    emojiUnicodeHint: 'Unicode emoji (e.g. ??) or custom server emoji (e.g. <:name:123>)',
    liaisonLabel: 'Junction:',
    endEmpty: 'End (empty = end)',
    valuePlaceholder: 'value',
    valueOrVar: 'value or {variable.x}',
    conditionTitle: 'Condition',
    casesTitle: 'Cases',
    targetChannelTitle: 'Target Channel',
    voiceChannelTitle: 'Voice Channel',
    destinationTitle: 'Destination',
    contentTitle: 'Content',
    channelTitle: 'Channel',
    statutTitle: 'Status',
    variableLabel: 'Variable',
    phOrFixedValue: 'or a fixed value',
    phOrThreshold: 'or {variable.threshold}',
    phOrChoice: 'or {variable.state}',
    phOrValue: 'or value',
    supportsVars: 'Supports',
    commonVarsLabel: 'Common variables:',
    saveLabel: 'Save',
    closeLabel: 'Close',
    phAvatarOrUrl: '{user.avatar} or direct URL',
    phUrlOrVar: 'https://? or {variable.bg}',
    phXpOr50: '{variable.xp} or 50',
    noOutputDefined: 'No output defined',
    // Section titles
    roleInfoTitle: 'Role Info',
    optionsTitle: 'Options',
    targetMemberTitle: 'Target Member',
    auditLogTitle: 'Audit Log',
    targetUserTitle: 'Target User',
    durationTitleSection: 'Duration',
    nicknameTitle: 'Nickname',
    channelInfoTitle: 'Channel Info',
    messageTitle: 'Message',
    randomTitle: 'Random',
    counterTitle: 'Counter',
    switchCaseTitle: 'Switch / Case',
    timeoutTitle: 'Timeout',
    commandInfoTitle: 'Command Info',
    parametersTitle: 'Parameters',
    permissionsTitle: 'Permissions',
    discordEventTitle: 'Discord Event',
    webhookTitleSection: 'Webhook',
    filtersTitle: 'Filters',
    tableTitleSection: 'Table',
    conditionsWhereTitle: 'Conditions WHERE',
    orderByTitle: 'Order By (ORDER BY)',
    stickerTitle: 'Sticker',
    eventTitleSection: 'Event',
    nodeInfoTitle: 'Node Info',
    executionTitle: 'Execution',
    notesTitle: 'Notes',
    newContentTitle: 'New Content',
    replyContentTitle: 'Reply Content',
    modalTitleSection: 'Modal',
    // Labels
    messageIdLabel: 'Message ID',
    channelIdLabel: 'Channel ID',
    typeLabel: 'Type',
    deleteMessageDays: 'Delete Message History (days)',
    topicLabel: 'Topic',
    parentCategoryId: 'Parent Category ID',
    volumeLabel: 'Volume (0-200 %)',
    urlLabel: 'URL',
    messageLabel: 'Message',
    headersJsonLabel: 'Headers (JSON)',
    bodyLabel: 'Body',
    eventLabel: 'Event',
    selfMuteLabel: 'Self Mute',
    selfDeafLabel: 'Self Deaf',
    usernameLabel: 'Username',
    avatarUrlLabelSmall: 'Avatar URL',
    imageUrlEmbedLabel: 'Image URL',
    footerLabelSmall: 'Footer',
    requiredCheckbox: 'Required',
    onErrorLabel: 'On Error',
    categoryLabel: 'Category',
    idLabel: 'ID',
    roleIdLabel: 'Role ID',
    inlineLabel: 'Inline',
    // Toggle labels
    hoistLabel: 'Hoist',
    mentionableHintToggle: 'Mentionable',
    mentionAuthorLabel: 'Mention Author',
    nsfwLabel: 'NSFW',
    alwaysOutputDataLabel: 'Always Output Data',
    executeOnceLabel: 'Execute Once',
    retryOnFailLabel: 'Retry on Fail',
    displayNoteInFlowLabel: 'Display Note in Flow',
    ttsLabel: 'Text-to-Speech',
    // Hints
    hoistHint: 'Display the role separately in the member list.',
    mentionableHintText: 'Allow anyone to @mention this role.',
    reasonForKick: 'Reason for kick',
    reasonForBan: 'Reason for ban',
    reasonForUnban: 'Reason for unban',
    reasonForTimeout: 'Reason for timeout',
    reasonForNicknameChange: 'Reason for nickname change',
    reasonForDeletion: 'Reason for deletion',
    daysRangeHint: '0-7 days.',
    blankToRemoveNickname: 'Leave blank to remove the member\'s nickname.',
    nsfwHint: 'Mark the channel as age-restricted.',
    irreversibleDeleteChannelWarning: 'This action is irreversible. The channel and all its messages will be permanently deleted.',
    irreversibleDeleteMsgWarning: 'The message will be permanently deleted and cannot be recovered.',
    mentionAuthorHint: 'Ping the original message author in the reply.',
    ttsHint: 'Read the reply aloud.',
    coreBotDesc: 'The **Core Bot** is the entry point of your workflow. Connect **Command Handlers** and **Event Handlers** to this node to register them.',
    noSettingsHint: 'No settings to configure here. Manage your bot token and deployment from the Dashboard.',
    noConfigAvailable: 'No configuration available for this node type.',
    alwaysOutputHint: 'Return an empty array even when no data is produced.',
    executeOnceHint: 'Process only the first input item and ignore the rest.',
    retryOnFailHint: 'Automatically retry the node if it throws an error.',
    notesPlaceholder: 'Describe what this node does... (Markdown supported)',
    displayNoteHint: 'Show this note as a card on the workflow canvas.',
    executeOnceEventHint: 'Handler fires once, then removes itself.',
    firesWhenPrefix: 'Fires when Discord emits the',
    firesWhenSuffix: 'event.',
    slashCommandPrefix: 'Slash command:',
    // Placeholders
    newMessageText: 'New message text...',
    yourReply: 'Your reply...',
    optionalAuditLogReason: 'Optional audit log reason',
    newRolePlaceholder: 'new role',
    channelTopicPlaceholder: 'Channel topic',
    categoryChannelIdPlaceholder: 'Category channel ID (optional)',
    leaveEmptyToResetPlaceholder: 'Leave empty to reset',
    reasonForNicknameChangePlaceholder: 'Reason for nickname change',
    serverDescPlaceholder: 'Server description',
    // Permission tab
    discordPermissionTab: 'Discord Permission',
    customRoleTab: 'Custom Role',
    addParameter: 'Add Parameter',
    addRole: 'Add Role',
    roleNamePlaceholder: 'Role name',
    descriptionPlaceholder: 'Description',
    // Activity types
    playingActivity: '?? Playing',
    streamingActivity: '?? Streaming',
    listeningActivity: '?? Listening to',
    watchingActivity: '?? Watching',
    competingActivity: '?? Competing in',
    customStatusActivity: '?? Custom Status',
    // Button styles
    primaryStyle: 'Primary',
    secondaryStyle: 'Secondary',
    successStyle: 'Success',
    dangerStyle: 'Danger',
    linkStyle: 'Link',
    // On Error options
    stopWorkflow: 'Stop Workflow',
    continueOption: 'Continue',
    continueErrorOutput: 'Continue (using error output)',
    // Tab labels
    parametersTab: 'Parameters',
    settingsTab: 'Settings',
    // Misc
    docsBtn: 'Docs',
    outputJson: 'Output JSON',
    inputLabel: '?| Input',
    botInstance: 'Bot Instance',
    imageUrlSection: 'Image URL',
    contentLabel: 'Content',
    reasonLabel: 'Reason',
    userIdLabel: 'User ID',
    nameLabel: 'Name',
    colorLabel2: 'Color',
    threadIdLabel: 'Thread ID',
    customIdLabel: 'Custom ID *',
    emojiLabel: 'Emoji',
    statusLabel: 'Status',
    minLabel: 'Min',
    maxLabel: 'Max',
    placeholderLabel: 'Placeholder',
    valueLabel: 'Value *',
    feedbackHint: 'I wish this node would...',
    outputLabelRight: 'Output |?',
    ascLabel: 'ASC ?',
    descLabel: 'DESC ?',
    footerLabel: 'Footer',
    channelIdRequired: 'Channel ID',
    botInstanceFallback: 'Bot Instance',
    nameRequired: 'Name',
    descriptionRequired: 'Description',
    addParameterBtn: 'Add Parameter',
    addRoleBtn: 'Add Role',
    executeOnceEventLabel: 'Execute Once',
    noTablesHint: 'No tables found',
    optionsSectionTitle: 'Options',
    rectangleLabel: 'Rectangle',
    imageLabel: 'Image',
    profileCard: 'Profile Card',
    welcomeBanner: 'Welcome Banner',
    rankCard: 'Rank Card',
    squareLabel: 'Square (512)',
    textChannel: 'Text Channel',
    categoryChannel: 'Category',
    forumChannel: 'Forum Channel',
    announcementChannel: 'Announcement Channel',
    days: 'Days',
    stringType: 'String',
    integerType: 'Integer',
    numberType: 'Number',
    booleanType: 'Boolean',
    userType: 'User',
    roleType: 'Role',
    channelType: 'Channel',
    mentionableType: 'Mentionable',
    attachmentType: 'Attachment',
    ctxUserId: 'User ID',
    ctxUsername: 'Username',
    ctxUserTag: 'User Tag',
    ctxGuildId: 'Guild ID',
    ctxGuildName: 'Guild Name',
    ctxChannelId: 'Channel ID',
    ctxChannelName: 'Channel Name',
    ctxBotId: 'Bot ID',
    ctxBotUsername: 'Bot Username',
    // Event groups
    groupCore: 'Core',
    groupMessages: 'Messages',
    groupGuild: 'Guild',
    groupMembers: 'Members',
    groupChannels: 'Channels',
    groupRoles: 'Roles',
    groupVoice: 'Voice',
    groupInvites: 'Invites',
    // JSON tree
    moreItems: 'more',
    moreKeys: 'more keys',
    // Canvas layer tabs
    tabStyle: '?? Style',
    tabPosition: '?? Position',
    tabShadow: '?? Shadow',
    // Gradient directions
    dirHorizontal: '? Horizontal',
    dirVertical: '? Vertical',
    dirDiagonal: '? Diagonal',
    // Font weights
    weightNormal: 'Normal',
    weightBold: 'Bold',
    weightBlack: 'Black (900)',
    // Misc labels
    sendImageNode: 'Send Image',
    customIdLabel2: 'Custom ID',
    viaPrefix: 'Via',
    etcSuffix: ', etc.',
    durationMs: '(ms)',
    descriptionEllipsis: 'Description...',
    placeholderPing: 'e.g. ping',
    placeholderPingDesc: 'e.g. Replies with pong',
    statusRunning: 'Running',
    statusStopped: 'Stopped',
    outputJsonSection: 'Output JSON',
    frArrayAndHint: '(array) and',
  },

  aiChat: {
    addNode: '+node',
    editNode: '~node',
    deleteNode: '?node',
    addEdge: '+edge',
    deleteEdge: '?edge',
    addNodeDesc: 'Add **{nodeType}**{tempId}',
    editNodeDesc: 'Edit {label} ? {keys}',
    deleteNodeDesc: 'Delete {label}',
    addEdgeDesc: 'Connect {source} ? {target} ({handle})',
    deleteEdgeDesc: 'Delete connection {edgeId}',
    newLabel: '+new ? ',
    suggestionAnalyze: 'Analyze my workflow',
    suggestionAddCommand: 'Add a /hello command',
    suggestionWelcome: 'Welcome message when someone joins',
    suggestionDebug: 'Debug errors in this workflow',
    suggestionExplain: 'Explain each node',
    toolbarTitle: 'AI Workflow',
    contextNodeOnly: 'Context: selected node only',
    contextFullWorkflow: 'Context: full workflow',
    selectionLabel: 'Selection',
    undoLabel: 'Undo',
    undoTooltip: 'Undo last AI modification',
    clearConfirm: 'Clear AI chat history?',
    clearTooltip: 'Clear history',
    untitledWorkflow: 'Untitled workflow',
    invalidResponse: 'Invalid AI response.',
    communicationError: 'Error communicating with AI.',
    emptyTitle: 'AI Assistant ? Workflow',
    emptyDescription: 'Analyze, create, edit and debug your workflow.\nAI knows all your nodes and can edit them directly.',
    canvasPreview: 'Canvas preview',
    detailsOf: 'Details of',
    modification: 'modification',
    modifications: 'modifications',
    applied: 'Applied',
    apply: 'Apply',
    analyzing: 'Analyzing?',
    contextNodeHint: 'Context: node',
    contextWorkflowHint: 'Context: entire workflow',
    placeholderNode: 'Question about "{label}"?',
    placeholderDefault: 'Ask a question or request a modification?',
    shortcutSend: '? Send',
    shortcutNewline: 'Shift+? New line',
    nodesInWorkflow: 'node(s) in workflow',
  },

  partner: {
    title: 'Partner Program',
    subtitle: 'Refer users and earn commissions on their subscriptions.',
    balance: 'Balance',
    totalEarned: 'Total Earned',
    referralsCount: 'Referrals',
    referralLink: 'Referral Link',
    referralDesc: 'Share this link. Users who sign up get 10% off and you earn 10% commission.',
    stripeConnect: 'Stripe Account',
    stripeConnectDesc: 'Connect your Stripe account to receive commission payments.',
    connected: 'Connected',
    payoutsEnabled: 'Payouts enabled',
    connectStripe: 'Connect Stripe',
    withdraw: 'Withdraw',
    withdrawDesc: 'Withdraw your balance to your Stripe account (minimum ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬10).',
    availableBalance: 'Available balance',
    withdrawBtn: 'Withdraw',
    withdrawSuccess: 'Withdrawal of ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬{amount} completed successfully.',
    withdrawError: 'Withdrawal failed.',
    connectFirst: 'Connect your Stripe account first.',
    minWithdraw: 'Minimum ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬10 required for withdrawal.',
    referrals: 'Referrals',
    noReferrals: 'No referrals yet.',
    email: 'Email',
    date: 'Date',
    earnings: 'Commissions',
    noEarnings: 'No commissions yet.',
    amount: 'Amount',
    description: 'Description',
    withdrawals: 'Withdrawal History',
    statusCompleted: 'Completed',
    statusPending: 'Pending',
    statusFailed: 'Failed',
    loadError: 'Failed to load partner data.',
    connectError: 'Stripe connection error.',
  },
  onboarding: {
    cat_welcome: 'Welcome',
    cat_dashboard: 'Dashboard',
    cat_workflow: 'Workflow',
    next: 'Next',
    prev: 'Back',
    skip: 'Skip tour',
    finish: 'Get started!',
    waitingForAction: 'Perform the action to continue\u2026',
    welcomeTitle: 'Welcome to DisFlow!',
    welcomeDesc: 'Let\u0027s discover your workspace together. This interactive tour will guide you through creating your first Discord bot \u2014 no code required.',
    statsTitle: 'Your Statistics',
    statsDesc: 'These cards show you a real-time overview of your bots: total count, active, stopped, and your workflows.',
    widgetsTitle: 'Monitoring Widgets',
    widgetsDesc: 'Track your bot performance with execution charts, activity feeds, error rates, and resource usage at a glance.',
    botlistTitle: 'Your Instances',
    botlistDesc: 'Here you\u0027ll find all your Discord bots. You can start, stop, edit, or delete them. Each bot is linked to a workflow.',
    createBotTitle: 'Create Your First Bot',
    createBotDesc: 'Click the \u0022New Instance\u0022 button to create your first bot. You\u0027ll need your Discord bot token (from the Discord Developer Portal).',
    workflowWelcomeTitle: 'Workflow Editor',
    workflowWelcomeDesc: 'This is where the magic happens! Design your bot\u0027s behavior visually by connecting nodes together \u2014 like building blocks.',
    headerTitle: 'The Toolbar',
    headerDesc: 'Here you can rename your workflow, see the linked bot status, import/export your project, and access keyboard shortcuts.',
    leftSidebarTitle: 'Left Sidebar',
    leftSidebarDesc: 'Access your databases, team members, canvas settings, ready-made templates, and a help section \u2014 all from this panel.',
    canvasTitle: 'The Canvas',
    canvasDesc: 'This is your visual workspace. Drag nodes to reposition them, double-click a node to configure it, and zoom in/out with your mouse wheel.',
    sidebarTitle: 'Node Library',
    sidebarDesc: 'This sidebar contains all the building blocks for your bot: triggers, actions, logic, and more. Browse categories or search for specific nodes.',
    addTriggerTitle: 'Add a Trigger',
    addTriggerDesc: 'Drag a \u0022Command Handler\u0022 or \u0022Event Handler\u0022 from the sidebar onto the canvas. Triggers define when your bot responds.',
    addActionTitle: 'Add an Action',
    addActionDesc: 'Now drag an action node like \u0022Send Message\u0022 onto the canvas. Actions define what your bot does when triggered.',
    connectTitle: 'Connect Nodes',
    connectDesc: 'Drag from a node\u0027s output handle (right side) to another node\u0027s input handle (left side) to create a connection. This defines the flow.',
    bottomBarTitle: 'Bottom Panel',
    bottomBarDesc: 'Toggle the AI Chat to get help building your workflow, or open the Console to see real-time execution logs when your bot is running.',
    saveTitle: 'Save Your Work',
    saveDesc: 'Click the Save button to save your workflow. Once saved, you can deploy it to make your bot live!',
    deployTitle: 'Deploy Your Bot',
    deployDesc: 'Hit Deploy to push your workflow to your bot. It will rebuild and restart automatically with your latest changes.',
    completeTitle: 'You\u0027re All Set! \ud83c\udf89',
    completeDesc: 'You now know the basics of DisFlow. Create triggers, add actions, connect them, and deploy your bot. Happy building!',
    restartTour: 'Restart tour',
  },

  // Ã¢â€â‚¬Ã¢â€â‚¬ Documentation Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  docs: {
    docsLabel: 'Docs',
    homeLabel: 'Documentation',
    homeTitle: 'DisFlow Documentation',
    homeSubtitle: 'Everything you need to build powerful Discord bots Ã¢â‚¬â€ no code required.',
    searchPlaceholder: 'Search documentation...',
    articlesLabel: 'articles',

    // Ã¢â€â‚¬Ã¢â€â‚¬ Getting Started Ã¢â€â‚¬Ã¢â€â‚¬
    gettingStartedTitle: 'Getting Started',
    gettingStartedDesc: 'New to DisFlow? Learn the basics and create your first bot in minutes.',
    whatIsDisflowTitle: 'What is DisFlow?',
    whatIsDisflowBody: `DisFlow is a **visual no-code platform** that lets you build Discord bots by connecting nodes on a canvas Ã¢â‚¬â€ no programming skills required.

## How it works

- **Drag & drop** trigger and action nodes onto the canvas
- **Connect** them together to define your bot\'s behaviour
- **Configure** each node using a simple sidebar panel
- **Deploy** with one click and your bot goes live instantly

:::tip
DisFlow handles all the complex Discord API interactions behind the scenes. You just focus on *what* your bot should do, not *how* it does it.
:::

## Who is it for?

- Community managers who want custom bots without hiring a developer
- Server owners looking for moderation, welcome messages, or mini-games
- Developers who want to rapidly prototype bot ideas
- Anyone who wants a visual approach to bot creation`,

    createAccountTitle: 'Creating Your Account',
    createAccountBody: `## Sign up options

You can register using:

- **Email & password** Ã¢â‚¬â€ fill in the form on the Register page
- **Discord OAuth** Ã¢â‚¬â€ click "Continue with Discord" to log in instantly

:::info
Using Discord OAuth links your Discord identity to DisFlow, making it easier to manage bot tokens and permissions later.
:::

## Setting up your profile

After registering, head to **Dashboard Ã¢â€ â€™ Settings** to:

- Choose your preferred language (32+ languages available)
- Select your theme (light or dark)
- Configure notification preferences`,

    firstBotTitle: 'Creating Your First Bot',
    firstBotBody: `## Step-by-step

1. Go to the **Dashboard**
2. Click the **"+ New Bot"** button
3. Enter your bot\'s **name** and **Discord token**
4. Click **Create** Ã¢â‚¬â€ your bot instance is ready!

## Next steps

Once your bot is created, click on it to open the **Workflow Editor**. From there:

- Add a **Command handler** (e.g. /ping)
- Connect it to a **Send Message** action
- Hit **Save** then **Deploy**

:::tip
Start simple! A /ping command is the perfect first workflow to test that everything works correctly.
:::

## Bot status

Your bot will show one of these statuses on the dashboard:

- **Online** Ã¢â‚¬â€ bot is running and connected to Discord
- **Offline** Ã¢â‚¬â€ bot is stopped
- **Error** Ã¢â‚¬â€ something went wrong, check the console logs`,

    discordTokenTitle: 'Getting a Discord Bot Token',
    discordTokenBody: `## Creating a Discord Application

1. Go to the **Discord Developer Portal** (https://discord.com/developers/applications)
2. Click **"New Application"** and give it a name
3. Navigate to the **Bot** tab on the left
4. Click **"Add Bot"** and confirm

## Copying the token

1. Under the Bot tab, click **"Reset Token"**
2. Copy the token that appears

:::warning
Never share your bot token publicly! Anyone with the token can control your bot. If it leaks, reset it immediately from the Developer Portal.
:::

## Inviting the bot to your server

1. Go to the **OAuth2 Ã¢â€ â€™ URL Generator** tab
2. Select scopes: **bot** and **applications.commands**
3. Select the permissions your bot needs
4. Copy the generated URL and open it in your browser
5. Choose your server and click **Authorize**

## Required Intents

Under the Bot tab, enable these privileged intents if your bot needs them:

- **Presence Intent** Ã¢â‚¬â€ to track online/offline status
- **Server Members Intent** Ã¢â‚¬â€ to react to member join/leave
- **Message Content Intent** Ã¢â‚¬â€ to read message text`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Dashboard Ã¢â€â‚¬Ã¢â€â‚¬
    dashboardTitle: 'Dashboard',
    dashboardDesc: 'Navigate your bots, stats, and settings from the main dashboard.',
    dashOverviewTitle: 'Dashboard Overview',
    dashOverviewBody: `The dashboard is your **command centre** for managing all your DisFlow bots.

## Layout

- **Stats bar** at the top Ã¢â‚¬â€ total bots, online bots, total workflows, deployments
- **Bot cards** Ã¢â‚¬â€ each card shows the bot name, status, and quick actions
- **Sidebar** Ã¢â‚¬â€ navigate between Dashboard, Databases, Members, and Settings

## Quick actions

From each bot card you can:

- **Open** the Workflow Editor
- **Start / Stop** the bot
- **Delete** the bot instance
- View **logs** and recent activity`,

    dashStatsTitle: 'Stats & Widgets',
    dashStatsBody: `## Dashboard widgets

The dashboard features real-time overview widgets:

- **Total Bots** Ã¢â‚¬â€ number of bot instances you\'ve created
- **Online Bots** Ã¢â‚¬â€ how many are currently running
- **Workflows** Ã¢â‚¬â€ total saved workflows across all bots
- **Deployments** Ã¢â‚¬â€ how many times you\'ve deployed today

:::tip
Widgets update in real-time. Keep the dashboard open to monitor your bots\' health at a glance.
:::`,

    dashInstancesTitle: 'Managing Bot Instances',
    dashInstancesBody: `## Instance page

Click a bot card to open its dedicated instance page where you can:

- See detailed **status** and **uptime**
- View and manage **workflows** attached to this bot
- Access **logs** and **console** output
- Update the bot **token** or **settings**

## Starting and stopping

- Click **Start** to boot the bot and connect it to Discord
- Click **Stop** to gracefully shut it down
- Use **Restart** to apply changes after editing the token

:::info
Stopping a bot does not delete any workflows or data. You can restart it at any time.
:::`,

    dashSettingsTitle: 'Account Settings',
    dashSettingsBody: `## Customisation

In **Dashboard Ã¢â€ â€™ Settings** you can configure:

- **Language** Ã¢â‚¬â€ choose from 32+ languages
- **Theme** Ã¢â‚¬â€ dark or light mode
- **Accent colour** Ã¢â‚¬â€ personalise the interface
- **Notifications** Ã¢â‚¬â€ email and browser notifications

## Security

- Change your **password**
- Enable **two-factor authentication** (if available)
- View active **sessions**
- **Delete account** Ã¢â‚¬â€ removes all data permanently`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Canvas Ã¢â€â‚¬Ã¢â€â‚¬
    canvasTitle: 'Canvas & Editor',
    canvasDesc: 'Master the visual workflow editor Ã¢â‚¬â€ nodes, connections, and shortcuts.',
    canvasBasicsTitle: 'Canvas Basics',
    canvasBasicsBody: `The canvas is the main workspace where you build your bot\'s logic visually.

## Navigation

- **Pan** Ã¢â‚¬â€ click and drag on the empty canvas
- **Zoom** Ã¢â‚¬â€ scroll wheel or pinch on trackpad
- **Fit view** Ã¢â‚¬â€ double-click the empty canvas or use the minimap

## Elements

- **Nodes** Ã¢â‚¬â€ coloured blocks representing triggers, actions, or logic
- **Edges** Ã¢â‚¬â€ lines connecting nodes to define the execution flow
- **Handles** Ã¢â‚¬â€ small dots on node edges where connections attach

:::tip
Use the minimap (bottom-right corner) to navigate large workflows quickly.
:::`,

    addNodesTitle: 'Adding Nodes',
    addNodesBody: `## Methods

There are two ways to add nodes:

1. **Left sidebar** Ã¢â€ â€™ Browse categories Ã¢â€ â€™ Click or drag a node onto the canvas
2. **Right-click** the canvas Ã¢â€ â€™ Quick-add menu

## Node categories

- **Handlers** (triggers) Ã¢â‚¬â€ what starts the flow (commands, events, buttonsÃ¢â‚¬Â¦)
- **Actions** Ã¢â‚¬â€ what the bot does (send message, manage rolesÃ¢â‚¬Â¦)
- **Logic** Ã¢â‚¬â€ conditions, loops, variables
- **Database** Ã¢â‚¬â€ SQL queries, table management

:::tip
Use the search bar in the sidebar to quickly find a specific node type.
:::`,

    connectNodesTitle: 'Connecting Nodes',
    connectNodesBody: `## How to connect

1. Hover over a node\'s **output handle** (right side) Ã¢â‚¬â€ it will highlight
2. **Click and drag** from the output handle
3. Drop onto another node\'s **input handle** (left side)

A coloured line (edge) appears between them, representing the flow direction.

## Rules

- A trigger node can connect to multiple actions (parallel execution)
- An action can only have **one incoming** connection
- You cannot create **circular** loops (A Ã¢â€ â€™ B Ã¢â€ â€™ A)
- Logic nodes (conditions) have **multiple outputs** (true/false paths)

:::warning
Disconnected nodes won\'t execute when the bot runs. Make sure every action is connected to a trigger chain.
:::`,

    configureNodesTitle: 'Configuring Nodes',
    configureNodesBody: `## Opening the config panel

Click any node to open its **configuration sidebar** on the right. Each node type has specific settings.

## Common fields

- **Label** Ã¢â‚¬â€ a custom name to identify the node on the canvas
- **Channel** Ã¢â‚¬â€ which Discord channel to target
- **Content** Ã¢â‚¬â€ the text message to send

## Variables

Use dynamic values with the **\`{variable}\`** syntax:

- \`{user.name}\` Ã¢â‚¬â€ the triggering user\'s name
- \`{user.id}\` Ã¢â‚¬â€ their Discord ID
- \`{channel.name}\` Ã¢â‚¬â€ the channel where the event happened
- \`{args}\` Ã¢â‚¬â€ command arguments

:::tip
Click the variable icon in any text field to browse available variables.
:::`,

    shortcutsTitle: 'Keyboard Shortcuts',
    shortcutsBody: `## Canvas shortcuts

- **Ctrl + S** Ã¢â‚¬â€ Save workflow
- **Ctrl + Z** Ã¢â‚¬â€ Undo
- **Ctrl + Shift + Z** Ã¢â‚¬â€ Redo
- **Delete / Backspace** Ã¢â‚¬â€ Delete selected node or edge
- **Ctrl + A** Ã¢â‚¬â€ Select all nodes
- **Ctrl + C / V** Ã¢â‚¬â€ Copy / Paste nodes
- **Escape** Ã¢â‚¬â€ Deselect all

## Navigation

- **Space + Drag** Ã¢â‚¬â€ Pan the canvas
- **Scroll** Ã¢â‚¬â€ Zoom in/out
- **Ctrl + Shift + F** Ã¢â‚¬â€ Fit all nodes in view

:::tip
Holding **Shift** while clicking lets you select multiple nodes.
:::`,

    importExportTitle: 'Import & Export',
    importExportBody: `## Exporting a workflow

1. Open the workflow in the editor
2. Click the **menu** button (top bar) Ã¢â€ â€™ **Export**
3. The workflow is saved as a JSON file

## Importing a workflow

1. In the editor, click **menu** Ã¢â€ â€™ **Import**
2. Select a previously exported JSON file
3. The nodes and edges are loaded onto the canvas

:::info
Exported workflows can be shared with other DisFlow users. They just need to import the JSON file into their own editor.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Handlers Ã¢â€â‚¬Ã¢â€â‚¬
    handlersTitle: 'Handlers & Triggers',
    handlersDesc: 'Set up the events and commands that start your bot workflows.',
    commandHandlerTitle: 'Command Handler',
    commandHandlerBody: `The Command Handler triggers your workflow when a user types a **slash command**.

## Configuration

- **Command name** Ã¢â‚¬â€ the name after the slash (e.g. \`/ping\`)
- **Description** Ã¢â‚¬â€ shown in Discord\'s command menu
- **Options** Ã¢â‚¬â€ add parameters (string, integer, user, channel, role, boolean)

## Example

A simple **/ping** command:

1. Add a **Command Handler** node Ã¢â€ â€™ set name to \`ping\`
2. Connect it to a **Send Message** node Ã¢â€ â€™ set content to \`Pong! Ã°Å¸Ââ€œ\`
3. Deploy

:::tip
Discord caches slash commands. After deploying for the first time, it may take up to an hour for the command to appear. Subsequent updates are faster.
:::

## Available variables

- \`{user}\` Ã¢â‚¬â€ the user who ran the command
- \`{channel}\` Ã¢â‚¬â€ where the command was used
- \`{guild}\` Ã¢â‚¬â€ the server
- \`{args.optionName}\` Ã¢â‚¬â€ value of command options`,

    eventHandlerTitle: 'Event Handler',
    eventHandlerBody: `The Event Handler triggers when a **Discord event** occurs Ã¢â‚¬â€ no user command needed.

## Available events

- **messageCreate** Ã¢â‚¬â€ a message is sent in a channel
- **guildMemberAdd** Ã¢â‚¬â€ someone joins the server
- **guildMemberRemove** Ã¢â‚¬â€ someone leaves or is removed
- **messageReactionAdd** Ã¢â‚¬â€ a reaction is added
- **voiceStateUpdate** Ã¢â‚¬â€ someone joins/leaves a voice channel
- **interactionCreate** Ã¢â‚¬â€ a button, select menu, or modal is submitted
- And many moreÃ¢â‚¬Â¦

## Configuration

1. Drag an **Event Handler** onto the canvas
2. Select the event type from the dropdown
3. (Optional) Add filters Ã¢â‚¬â€ e.g. only trigger in specific channels

:::info
Some events require **privileged intents** to be enabled in the Discord Developer Portal. Check the "Getting a Discord Bot Token" guide for details.
:::`,

    buttonHandlerTitle: 'Button Handler',
    buttonHandlerBody: `The Button Handler triggers when a user **clicks a button** that your bot previously sent.

## How it works

1. First, send a message with buttons using the **Send Message** + **Add Button** action
2. Assign each button a unique **Custom ID**
3. Add a **Button Handler** node and set the same Custom ID

When a user clicks that button, the handler fires and executes the connected actions.

## Configuration

- **Custom ID** Ã¢â‚¬â€ must match the button\'s ID exactly
- **Ephemeral reply** Ã¢â‚¬â€ option to reply only visible to the clicker

:::tip
Use descriptive Custom IDs like \`verify-role\` or \`ticket-open\` to keep your workflow readable.
:::`,

    selectMenuHandlerTitle: 'Select Menu Handler',
    selectMenuHandlerBody: `Triggers when a user **picks an option** from a select menu (dropdown).

## Setup

1. Send a message with a select menu via the **Add Select Menu** action
2. Define options with unique values
3. Add a **Select Menu Handler** with the matching Custom ID

## Available variables

- \`{values}\` Ã¢â‚¬â€ the selected option value(s)
- \`{user}\` Ã¢â‚¬â€ who made the selection

:::info
Select menus can be configured as **single-select** or **multi-select**. For multi-select, \`{values}\` will contain all chosen options.
:::`,

    modalHandlerTitle: 'Modal Handler',
    modalHandlerBody: `Triggers when a user **submits a modal** (popup form).

## Creating a modal flow

1. First, show the modal using an **Open Modal** action (typically from a button or command)
2. Define the modal fields (text inputs)
3. Add a **Modal Handler** with the matching Custom ID

## Configuration

- **Custom ID** Ã¢â‚¬â€ must match the modal\'s ID
- Fields are accessible via \`{fields.fieldId}\`

## Example: Ticket system

1. User clicks a "Create Ticket" button
2. A modal opens asking for subject and description
3. The Modal Handler receives the submission
4. Connected actions create a channel and post the ticket info

:::tip
Modals can have up to **5 text inputs** Ã¢â‚¬â€ use short or paragraph style.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Actions Ã¢â€â‚¬Ã¢â€â‚¬
    actionsTitle: 'Discord Actions',
    actionsDesc: 'Send messages, manage roles, moderate Ã¢â‚¬â€ all the things your bot can do.',
    sendMessageTitle: 'Send Message',
    sendMessageBody: `The most common action Ã¢â‚¬â€ sends a text message to a Discord channel.

## Configuration

- **Channel** Ã¢â‚¬â€ select a specific channel or use \`{channel}\` for the current one
- **Content** Ã¢â‚¬â€ the text to send (supports variables and Discord markdown)
- **Reply** Ã¢â‚¬â€ toggle to make the message a reply to the triggering message

## Discord Markdown

- **Bold**: \`**text**\`
- *Italic*: \`*text*\`
- __Underline__: \`__text__\`
- ~~Strikethrough~~: \`~~text~~\`
- Code: \`\\\`code\\\`\`
- Code block: \`\\\`\\\`\\\`lang\\ncode\\\`\\\`\\\`\`

:::tip
Combine the Send Message action with an **Embed** node for rich, formatted messages with colours, images, and fields.
:::`,

    editDeleteTitle: 'Edit & Delete Messages',
    editDeleteBody: `## Edit a message

Use the **Edit Message** action to modify a previously sent message:

- **Message ID** Ã¢â‚¬â€ the ID of the message to edit (use \`{message.id}\` from a previous send)
- **New content** Ã¢â‚¬â€ the updated text

## Delete a message

The **Delete Message** action removes a message:

- **Message ID** Ã¢â‚¬â€ the ID to delete
- **Channel** Ã¢â‚¬â€ where the message is

:::warning
The bot can only edit or delete messages it has sent, or messages in channels where it has the **Manage Messages** permission.
:::`,

    embedsTitle: 'Embeds',
    embedsBody: `Embeds are **rich message cards** with colours, titles, images, and structured fields.

## Embed fields

- **Title** Ã¢â‚¬â€ bold header text
- **Description** Ã¢â‚¬â€ main body text (supports markdown)
- **Colour** Ã¢â‚¬â€ border colour (hex or preset)
- **Thumbnail** Ã¢â‚¬â€ small image (top-right)
- **Image** Ã¢â‚¬â€ large image at the bottom
- **Footer** Ã¢â‚¬â€ small text at the bottom
- **Author** Ã¢â‚¬â€ name and icon at the top
- **Fields** Ã¢â‚¬â€ key-value pairs (inline or stacked)

## Adding fields

Click **"+ Add Field"** to add structured data:

- **Name** Ã¢â‚¬â€ field title
- **Value** Ã¢â‚¬â€ field content
- **Inline** Ã¢â‚¬â€ display side-by-side with other inline fields

:::tip
You can send up to **10 embeds** in a single message. Use multiple embed nodes connected to one Send Message.
:::`,

    reactionsPinsTitle: 'Reactions & Pins',
    reactionsPinsBody: `## Adding reactions

The **Add Reaction** action adds an emoji reaction to a message:

- **Message ID** Ã¢â‚¬â€ target message
- **Emoji** Ã¢â‚¬â€ Unicode emoji or custom emoji ID

## Pinning messages

The **Pin Message** action pins a message to the channel:

- **Message ID** Ã¢â‚¬â€ the message to pin

:::info
Discord limits pinned messages to **50 per channel**. The bot needs the **Manage Messages** permission to pin and add reactions.
:::`,

    threadsTitle: 'Threads',
    threadsBody: `## Creating threads

The **Create Thread** action creates a new thread:

- **Name** Ã¢â‚¬â€ the thread title
- **Channel** Ã¢â‚¬â€ parent channel
- **Auto-archive** Ã¢â‚¬â€ duration before auto-archiving (1h, 24h, 3d, 7d)
- **Message** Ã¢â‚¬â€ optionally create from an existing message

## Sending to threads

Use the **Send Message** action with the thread\'s channel ID to post inside a thread.

:::tip
Threads are great for keeping discussions organised Ã¢â‚¬â€ use them for ticket systems, feedback, or topic-specific conversations.
:::`,

    dmTitle: 'Direct Messages',
    dmBody: `## Sending a DM

The **Send DM** action sends a private message to a user:

- **User** Ã¢â‚¬â€ the target user (use \`{user}\` or a specific ID)
- **Content** Ã¢â‚¬â€ the message text
- **Embed** Ã¢â‚¬â€ optional rich embed

:::warning
Some users have DMs disabled. Your workflow should handle the case where the DM fails. Consider adding a condition node to check for errors.
:::

:::tip
Common DM use cases: welcome messages on join, moderation notifications (kick/ban reasons), verification codes.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Interactions Ã¢â€â‚¬Ã¢â€â‚¬
    interactionsTitle: 'Interactions',
    interactionsDesc: 'Buttons, select menus, and modals Ã¢â‚¬â€ make your bot interactive.',
    buttonsTitle: 'Buttons',
    buttonsBody: `## Adding buttons to messages

Use the **Add Button** component in a Send Message action:

- **Style** Ã¢â‚¬â€ Primary (blue), Secondary (grey), Success (green), Danger (red), Link (URL)
- **Label** Ã¢â‚¬â€ the button text
- **Custom ID** Ã¢â‚¬â€ unique identifier (not needed for Link buttons)
- **Emoji** Ã¢â‚¬â€ optional emoji before the label
- **Disabled** Ã¢â‚¬â€ toggle to make the button unclickable

## Button rows

- Up to **5 buttons** per row
- Up to **5 rows** per message (25 buttons max)

## Handling clicks

Connect a **Button Handler** with the matching Custom ID to respond when users click.

:::tip
Use the *Danger* style for destructive actions (delete, ban) to give a visual warning to users.
:::`,

    selectMenusTitle: 'Select Menus',
    selectMenusBody: `## Types of select menus

- **String Select** Ã¢â‚¬â€ custom options you define
- **User Select** Ã¢â‚¬â€ lets users pick server members
- **Role Select** Ã¢â‚¬â€ lets users pick roles
- **Channel Select** Ã¢â‚¬â€ lets users pick channels
- **Mentionable Select** Ã¢â‚¬â€ users or roles

## Configuration (String Select)

- **Custom ID** Ã¢â‚¬â€ unique identifier
- **Placeholder** Ã¢â‚¬â€ greyed-out text before selection
- **Options** Ã¢â‚¬â€ label, value, description, and optional emoji for each
- **Min/Max values** Ã¢â‚¬â€ how many options can be selected

:::tip
Select menus are ideal for settings panels, role selectors, or any situation where users need to choose from a list.
:::`,

    modalsTitle: 'Modals (Popup Forms)',
    modalsBody: `## What are modals?

Modals are **popup forms** that appear over Discord. They can only be triggered by a button click or a slash command interaction.

## Configuration

- **Custom ID** Ã¢â‚¬â€ unique identifier
- **Title** Ã¢â‚¬â€ displayed at the top of the popup
- **Fields** Ã¢â‚¬â€ up to 5 text input fields

## Text input types

- **Short** Ã¢â‚¬â€ single-line input
- **Paragraph** Ã¢â‚¬â€ multi-line input

Each field has:

- **Custom ID** Ã¢â‚¬â€ to retrieve the value
- **Label** Ã¢â‚¬â€ shown above the field
- **Placeholder** Ã¢â‚¬â€ hint text
- **Required** Ã¢â‚¬â€ whether the user must fill it in
- **Min/Max length** Ã¢â‚¬â€ character limits

:::tip
Modals are perfect for feedback forms, ticket creation, application submissions, and bug reports.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Moderation Ã¢â€â‚¬Ã¢â€â‚¬
    moderationTitle: 'Moderation',
    moderationDesc: 'Keep your server safe Ã¢â‚¬â€ kicks, bans, timeouts, and permission checks.',
    kickBanTitle: 'Kick & Ban',
    kickBanBody: `## Kick

The **Kick Member** action removes a user from the server (they can rejoin with an invite):

- **User** Ã¢â‚¬â€ who to kick
- **Reason** Ã¢â‚¬â€ logged in Discord\'s audit log

## Ban

The **Ban Member** action permanently removes and blocks a user:

- **User** Ã¢â‚¬â€ who to ban
- **Reason** Ã¢â‚¬â€ audit log reason
- **Delete messages** Ã¢â‚¬â€ remove their messages from the last 0-7 days

:::warning
The bot\'s role must be **higher** in the role hierarchy than the target user\'s highest role. The bot also needs the **Kick Members** and/or **Ban Members** permissions.
:::

:::tip
Combine with a **Condition** node to check roles before kicking Ã¢â‚¬â€ e.g. don\'t kick users with the "Moderator" role.
:::`,

    timeoutMuteTitle: 'Timeout & Mute',
    timeoutMuteBody: `## Timeout

The **Timeout Member** action temporarily prevents a user from sending messages or joining voice:

- **User** Ã¢â‚¬â€ target member
- **Duration** Ã¢â‚¬â€ how long (1 minute to 28 days)
- **Reason** Ã¢â‚¬â€ audit log reason

## Removing a timeout

Use the **Remove Timeout** action or set the duration to \`0\`.

:::info
Timeouts are Discord\'s built-in mute feature. They\'re preferable to role-based muting because they:
- Show a countdown to the user
- Auto-expire
- Don\'t require a "Muted" role setup
:::`,

    bulkDeleteTitle: 'Bulk Delete Messages',
    bulkDeleteBody: `The **Bulk Delete** action removes multiple messages at once:

- **Channel** Ã¢â‚¬â€ which channel to purge
- **Count** Ã¢â‚¬â€ number of messages to delete (2-100)
- **Filter** Ã¢â‚¬â€ optionally filter by user or content

## Limitations

- Cannot delete messages **older than 14 days** (Discord API restriction)
- Maximum **100 messages** per action
- Requires the **Manage Messages** permission

:::tip
Combine with a **Command Handler** to create a /purge command. Add a permission check condition to ensure only moderators can use it.
:::`,

    permissionsTitle: 'Permission Checks',
    permissionsBody: `## Checking permissions

Use a **Condition** node to verify permissions before executing an action:

- **Has Role** Ã¢â‚¬â€ check if the user has a specific role
- **Has Permission** Ã¢â‚¬â€ check for Discord permissions (Manage Messages, Kick, Ban, etc.)
- **Is Bot Owner** Ã¢â‚¬â€ check if the user owns the server

## Permission hierarchy

Discord permissions follow a hierarchy:

1. Server owner (all permissions)
2. Administrator role (all permissions)
3. Role-based permissions (highest role wins)
4. Channel-specific overrides

:::warning
Always add permission checks to moderation commands. Without them, any user could use your kick/ban workflows!
:::

:::tip
Create a reusable "moderator check" by combining multiple conditions Ã¢â‚¬â€ e.g. has Moderator role OR has Manage Messages permission.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Guild Ã¢â€â‚¬Ã¢â€â‚¬
    guildTitle: 'Roles & Server',
    guildDesc: 'Manage roles, channels, emojis, and server settings.',
    rolesTitle: 'Role Management',
    rolesBody: `## Adding roles

The **Add Role** action gives a role to a member:

- **User** Ã¢â‚¬â€ target member
- **Role** Ã¢â‚¬â€ which role to add

## Removing roles

The **Remove Role** action takes a role away:

- **User** Ã¢â‚¬â€ target member
- **Role** Ã¢â‚¬â€ which role to remove

## Creating roles

The **Create Role** action makes a new role:

- **Name** Ã¢â‚¬â€ role name
- **Colour** Ã¢â‚¬â€ hex colour code
- **Permissions** Ã¢â‚¬â€ which permissions to grant
- **Hoist** Ã¢â‚¬â€ show separately in the member list
- **Mentionable** Ã¢â‚¬â€ allow anyone to mention this role

:::warning
The bot\'s highest role must be **above** the target role in the server\'s role hierarchy.
:::

:::tip
Use roles with the **guildMemberAdd** event to create auto-role workflows Ã¢â‚¬â€ give new members a role on join.
:::`,

    channelsTitle: 'Channel Management',
    channelsBody: `## Creating channels

The **Create Channel** action:

- **Name** Ã¢â‚¬â€ channel name
- **Type** Ã¢â‚¬â€ text, voice, category, announcement, stage, forum
- **Category** Ã¢â‚¬â€ parent category
- **Topic** Ã¢â‚¬â€ channel description (text channels)
- **Permission overrides** Ã¢â‚¬â€ per-role or per-user permissions

## Editing channels

The **Edit Channel** action modifies an existing channel:

- Change name, topic, slowmode, NSFW flag, etc.

## Deleting channels

The **Delete Channel** action removes a channel permanently.

:::warning
Channel deletion is **irreversible**! All messages in the channel will be lost. Consider adding a confirmation step.
:::`,

    emojisStickersTitle: 'Emojis & Stickers',
    emojisStickersBody: `## Custom emojis

The **Create Emoji** action uploads a custom emoji:

- **Name** Ã¢â‚¬â€ emoji name (alphanumeric and underscores)
- **Image** Ã¢â‚¬â€ URL or base64 of the image
- **Roles** Ã¢â‚¬â€ restrict usage to specific roles (optional)

## Stickers

The **Create Sticker** action adds a custom sticker:

- **Name** Ã¢â‚¬â€ sticker name
- **Description** Ã¢â‚¬â€ what the sticker represents
- **Tags** Ã¢â‚¬â€ related emoji for suggestions
- **File** Ã¢â‚¬â€ the sticker image (PNG, APNG, or Lottie)

:::info
Free servers are limited to **50 emojis** and **5 stickers**. Boosted servers get more slots.
:::`,

    invitesWebhooksTitle: 'Invites & Webhooks',
    invitesWebhooksBody: `## Invites

The **Create Invite** action generates a server invite:

- **Channel** Ã¢â‚¬â€ which channel the invite leads to
- **Max uses** Ã¢â‚¬â€ how many times it can be used (0 = unlimited)
- **Max age** Ã¢â‚¬â€ expiration time in seconds (0 = never)
- **Temporary** Ã¢â‚¬â€ kick the member when they disconnect if they don\'t get a role

## Webhooks

The **Create Webhook** action sets up a webhook:

- **Channel** Ã¢â‚¬â€ target channel
- **Name** Ã¢â‚¬â€ webhook display name
- **Avatar** Ã¢â‚¬â€ webhook profile picture

The **Send Webhook** action posts a message via webhook:

- **URL** Ã¢â‚¬â€ the webhook URL
- **Content** Ã¢â‚¬â€ message text
- **Username** Ã¢â‚¬â€ override the webhook name
- **Avatar URL** Ã¢â‚¬â€ override the profile picture

:::tip
Webhooks are great for cross-server notifications, logging systems, or sending messages that appear to come from a custom user.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Voice Ã¢â€â‚¬Ã¢â€â‚¬
    voiceTitle: 'Voice Channels',
    voiceDesc: 'Join, leave, play audio, and manage voice connections.',
    joinLeaveTitle: 'Join & Leave Voice',
    joinLeaveBody: `## Joining a voice channel

The **Join Voice** action connects the bot to a voice channel:

- **Channel** Ã¢â‚¬â€ which voice channel to join
- **Self Deaf** Ã¢â‚¬â€ whether the bot deafens itself (recommended)
- **Self Mute** Ã¢â‚¬â€ whether the bot mutes itself

## Leaving

The **Leave Voice** action disconnects the bot from its current voice channel.

:::info
The bot needs the **Connect** and **Speak** permissions for the target voice channel.
:::`,

    playAudioTitle: 'Play Audio',
    playAudioBody: `## Playing audio

The **Play Audio** action streams audio in a voice channel:

- **Source** Ã¢â‚¬â€ URL to an audio file or stream
- **Volume** Ã¢â‚¬â€ playback volume (0-100%)

## Controls

- **Pause** Ã¢â‚¬â€ temporarily stop playback
- **Resume** Ã¢â‚¬â€ continue playing
- **Stop** Ã¢â‚¬â€ end playback completely

:::tip
Supported formats include MP3, OGG, and WAV. For best performance, use direct links to audio files.
:::`,

    moveDisconnectTitle: 'Move & Disconnect Users',
    moveDisconnectBody: `## Moving users

The **Move Member** action transfers a user to a different voice channel:

- **User** Ã¢â‚¬â€ who to move
- **Channel** Ã¢â‚¬â€ destination voice channel

## Disconnecting users

The **Disconnect Member** action removes a user from voice:

- **User** Ã¢â‚¬â€ who to disconnect

:::warning
Both actions require the **Move Members** permission. The bot cannot move users to channels it doesn\'t have access to.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Bot Ã¢â€â‚¬Ã¢â€â‚¬
    botTitle: 'Bot Settings',
    botDesc: 'Configure your bot\'s presence, avatar, and nickname.',
    presenceTitle: 'Bot Presence & Status',
    presenceBody: `## Setting the status

The **Set Presence** action changes your bot\'s online status:

- **Status** Ã¢â‚¬â€ Online, Idle, Do Not Disturb, or Invisible
- **Activity type** Ã¢â‚¬â€ Playing, Streaming, Listening, Watching, Competing
- **Activity text** Ã¢â‚¬â€ what the bot is "playing", "watching", etc.

## Dynamic presence

Use variables to create dynamic status messages:

- \`Playing with {guild.memberCount} members\`
- \`Watching {guild.name}\`

:::tip
Set the presence in a **clientReady** event handler so it\'s applied every time the bot starts.
:::`,

    nicknameAvatarTitle: 'Nickname & Avatar',
    nicknameAvatarBody: `## Changing the nickname

The **Set Nickname** action changes the bot\'s nickname in a specific server:

- **Nickname** Ã¢â‚¬â€ the new display name (leave empty to reset)

## Changing the avatar

The **Set Avatar** action updates the bot\'s profile picture:

- **Image URL** Ã¢â‚¬â€ link to the new avatar image

:::warning
Discord rate-limits avatar changes to **twice per hour**. Don\'t use this in frequently triggered workflows!
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Logic Ã¢â€â‚¬Ã¢â€â‚¬
    logicTitle: 'Logic & Flow',
    logicDesc: 'Conditions, loops, variables, and data manipulation.',
    conditionsTitle: 'Conditions (If/Else)',
    conditionsBody: `The **Condition** node lets you create branching logic Ã¢â‚¬â€ if something is true, do X; otherwise, do Y.

## Configuration

- **Left value** Ã¢â‚¬â€ the value to check (e.g. \`{user.id}\`)
- **Operator** Ã¢â‚¬â€ equals, not equals, contains, greater than, less than, etc.
- **Right value** Ã¢â‚¬â€ the comparison value

## Outputs

- **True** path (green handle) Ã¢â‚¬â€ executes when the condition is met
- **False** path (red handle) Ã¢â‚¬â€ executes when it\'s not

## Combining conditions

Chain multiple condition nodes for complex logic:

- AND: connect conditions in series
- OR: connect the same trigger to multiple condition branches

:::tip
Use conditions to check permissions, compare values, filter events, or create different responses based on user input.
:::`,

    loopsTitle: 'Loops',
    loopsBody: `The **Loop** node repeats a set of actions multiple times.

## Types

- **For loop** Ã¢â‚¬â€ repeat a fixed number of times
- **For Each** Ã¢â‚¬â€ iterate over a list (e.g. server members, roles)
- **While** Ã¢â‚¬â€ repeat while a condition is true

## Configuration

- **Count** (for loop) Ã¢â‚¬â€ how many iterations
- **List** (for each) Ã¢â‚¬â€ the data to iterate over
- **Condition** (while) Ã¢â‚¬â€ checked before each iteration

## Loop variables

Inside the loop, you can access:

- \`{loop.index}\` Ã¢â‚¬â€ current iteration number (starts at 0)
- \`{loop.value}\` Ã¢â‚¬â€ current item (for-each loops)
- \`{loop.length}\` Ã¢â‚¬â€ total number of iterations

:::warning
Avoid infinite loops! Always ensure your while condition will eventually become false. DisFlow has a safety limit of 1000 iterations.
:::`,

    variablesTitle: 'Variables',
    variablesBody: `Variables let you **store and reuse data** across your workflow.

## Setting variables

Use the **Set Variable** action:

- **Name** Ã¢â‚¬â€ variable name (e.g. \`counter\`)
- **Value** Ã¢â‚¬â€ the data to store

## Using variables

Reference variables with curly braces: \`{counter}\`, \`{userName}\`, etc.

## Scope

- **Workflow variables** Ã¢â‚¬â€ available within the current execution
- **Global variables** Ã¢â‚¬â€ persist across executions (stored in the database)

## Variable types

- **String** Ã¢â‚¬â€ text data
- **Number** Ã¢â‚¬â€ integers and decimals
- **Boolean** Ã¢â‚¬â€ true/false
- **Array** Ã¢â‚¬â€ lists of values
- **Object** Ã¢â‚¬â€ key-value pairs

:::tip
Use the **Set Variable** action right after a trigger to capture and name important data for use later in the workflow.
:::`,

    mathStringTitle: 'Math & String Operations',
    mathStringBody: `## Math operations

The **Math** node performs calculations:

- **Add / Subtract / Multiply / Divide**
- **Modulo** Ã¢â‚¬â€ remainder after division
- **Power** Ã¢â‚¬â€ exponentiation
- **Random** Ã¢â‚¬â€ generate a random number
- **Round / Floor / Ceil**
- **Min / Max** Ã¢â‚¬â€ of two values

## String operations

The **String** node manipulates text:

- **Uppercase / Lowercase**
- **Trim** Ã¢â‚¬â€ remove whitespace
- **Replace** Ã¢â‚¬â€ find and replace text
- **Split** Ã¢â‚¬â€ divide text into an array
- **Slice** Ã¢â‚¬â€ extract a portion
- **Length** Ã¢â‚¬â€ character count
- **Includes** Ã¢â‚¬â€ check if text contains a substring

:::tip
Chain Math and String operations with variables to build dynamic, data-driven responses.
:::`,

    httpWebhookTitle: 'HTTP Requests & Webhooks',
    httpWebhookBody: `## Making HTTP requests

The **HTTP Request** action calls external APIs:

- **Method** Ã¢â‚¬â€ GET, POST, PUT, DELETE, PATCH
- **URL** Ã¢â‚¬â€ the API endpoint
- **Headers** Ã¢â‚¬â€ custom headers (e.g. Authorization)
- **Body** Ã¢â‚¬â€ request payload (JSON)

## Response

The response is available as variables:

- \`{http.status}\` Ã¢â‚¬â€ status code
- \`{http.body}\` Ã¢â‚¬â€ response body
- \`{http.headers}\` Ã¢â‚¬â€ response headers

## Example: Weather bot

1. Command Handler: /weather {city}
2. HTTP Request: GET https://api.example.com/weather?city={args.city}
3. Send Message: The weather in {args.city} is {http.body.temp}Ã‚Â°C

:::warning
Be cautious with external APIs Ã¢â‚¬â€ they may rate-limit your requests. Add error handling for failed requests.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Database Ã¢â€â‚¬Ã¢â€â‚¬
    databaseTitle: 'Database',
    databaseDesc: 'Store and query persistent data with your bot\'s built-in database.',
    sqlBasicsTitle: 'Database Basics',
    sqlBasicsBody: `DisFlow provides each bot with a **built-in MySQL database** for persistent data storage.

## What can you store?

- User profiles and levels
- Economy (coins, inventory)
- Warnings and moderation logs
- Custom settings per server
- Any structured data your bot needs

## Accessing the database

1. In the Workflow Editor, use **Database** nodes (Create Table, Select, Insert, Update, Delete)
2. From the Dashboard, use the **Database Viewer** to browse tables

:::tip
Plan your database structure before building. Think about what data you need to store and how it relates.
:::`,

    createTableTitle: 'Creating Tables',
    createTableBody: `The **Create Table** action sets up a new database table.

## Configuration

- **Table name** Ã¢â‚¬â€ alphanumeric and underscores (e.g. \`user_levels\`)
- **Columns** Ã¢â‚¬â€ define each column with:
  - **Name** Ã¢â‚¬â€ column name
  - **Type** Ã¢â‚¬â€ INT, VARCHAR(255), TEXT, BOOLEAN, DATETIME, etc.
  - **Primary Key** Ã¢â‚¬â€ unique identifier
  - **Auto-increment** Ã¢â‚¬â€ automatically assign IDs
  - **Default** Ã¢â‚¬â€ default value
  - **Not null** Ã¢â‚¬â€ require a value

## Example: User levels table

- \`id\` Ã¢â‚¬â€ INT, primary key, auto-increment
- \`user_id\` Ã¢â‚¬â€ VARCHAR(20), not null
- \`guild_id\` Ã¢â‚¬â€ VARCHAR(20), not null
- \`xp\` Ã¢â‚¬â€ INT, default 0
- \`level\` Ã¢â‚¬â€ INT, default 1

:::info
Tables are created per-bot. Each bot has its own isolated database.
:::`,

    selectInsertTitle: 'Querying Data',
    selectInsertBody: `## SELECT (reading data)

The **Select** action retrieves data:

- **Table** Ã¢â‚¬â€ which table to query
- **Columns** Ã¢â‚¬â€ which columns to return (* for all)
- **Where** Ã¢â‚¬â€ conditions to filter results
- **Order by** Ã¢â‚¬â€ sort results
- **Limit** Ã¢â‚¬â€ maximum rows to return

Results are available as \`{db.rows}\` (array) and \`{db.rows[0].columnName}\`.

## INSERT (writing data)

The **Insert** action adds a new row:

- **Table** Ã¢â‚¬â€ target table
- **Values** Ã¢â‚¬â€ key-value pairs for each column

## UPDATE

The **Update** action modifies existing rows:

- **Table** Ã¢â‚¬â€ target table
- **Set** Ã¢â‚¬â€ which columns to change
- **Where** Ã¢â‚¬â€ which rows to update

## DELETE

The **Delete** action removes rows:

- **Table** Ã¢â‚¬â€ target table
- **Where** Ã¢â‚¬â€ which rows to delete

:::warning
Always use a WHERE clause with UPDATE and DELETE to avoid affecting all rows!
:::`,

    dbViewerTitle: 'Database Viewer',
    dbViewerBody: `The **Database Viewer** is available from the Dashboard sidebar.

## Features

- **Browse tables** Ã¢â‚¬â€ see all tables for a bot
- **View data** Ã¢â‚¬â€ paginated table view of rows
- **Search** Ã¢â‚¬â€ filter rows by column values
- **Edit** Ã¢â‚¬â€ modify values directly in the viewer
- **Delete** Ã¢â‚¬â€ remove rows from the interface
- **Export** Ã¢â‚¬â€ download table data as CSV

## Accessing the viewer

1. Go to **Dashboard Ã¢â€ â€™ Databases**
2. Select a bot to view its tables
3. Click a table name to browse its data

:::tip
Use the Database Viewer for debugging Ã¢â‚¬â€ check if your workflows are reading and writing data correctly.
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Advanced Ã¢â€â‚¬Ã¢â€â‚¬
    advancedTitle: 'Advanced Features',
    advancedDesc: 'Code execution, AI chat, templates, and power-user features.',
    codeExecTitle: 'Custom Code Execution',
    codeExecBody: `The **Code** node lets you write custom JavaScript that runs inside your workflow.

## Configuration

- **Code** Ã¢â‚¬â€ your JavaScript code
- **Inputs** Ã¢â‚¬â€ variables available inside the code
- **Output** Ã¢â‚¬â€ the variable name to store the result

## Available APIs

Inside the code node, you have access to:

- \`inputs\` Ã¢â‚¬â€ the variables you defined
- \`return\` Ã¢â‚¬â€ return a value to store in the output variable

## Example: Random colour

\`\`\`javascript
const colours = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
return colours[Math.floor(Math.random() * colours.length)];
\`\`\`

:::warning
Code executes in a sandboxed environment. You cannot access the file system, network, or Node.js modules.
:::`,

    canvasCardTitle: 'Canvas Cards & Organisation',
    canvasCardBody: `## Grouping nodes

Use **Canvas Cards** (groups) to visually organise your workflow:

- Select multiple nodes (Shift + click)
- Right-click Ã¢â€ â€™ "Group Selection"
- Give the group a name and colour

## Benefits

- Keep related nodes together
- Add descriptions to explain sections
- Collapse groups to simplify the view
- Move groups as a single unit

:::tip
Use groups to separate different features Ã¢â‚¬â€ e.g. one group for the welcome system, another for moderation, and another for the levelling system.
:::`,

    templatesTitle: 'Templates',
    templatesBody: `Templates are **pre-built workflows** that you can insert into your canvas with one click.

## Using templates

1. Open the **Templates** tab in the left sidebar
2. Browse by category or search by name
3. Click **Insert** to add the template to your canvas

## Available categories

- **Moderation** Ã¢â‚¬â€ kick, ban, warn, purge
- **User** Ã¢â‚¬â€ welcome, goodbye, levels
- **Server** Ã¢â‚¬â€ auto-role, logging, feedback
- **Utility** Ã¢â‚¬â€ ping, help, info commands

## Customising templates

After inserting a template:

1. Review the nodes and connections
2. Modify settings (channel names, messages, etc.)
3. Save and deploy

:::tip
Templates are a great starting point. Insert one, learn from the node layout, and customise it to your needs.
:::`,

    aiChatTitle: 'AI Chat Assistant',
    aiChatBody: `The **AI Chat** is available from the bottom bar of the Workflow Editor.

## What it can help with

- **Explain nodes** Ã¢â‚¬â€ ask what a specific node does
- **Suggest workflows** Ã¢â‚¬â€ describe what you want and get step-by-step guidance
- **Debug issues** Ã¢â‚¬â€ paste an error and get help fixing it
- **Answer questions** Ã¢â‚¬â€ anything related to DisFlow or Discord bots

## How to use

1. Click the **AI Chat** button in the bottom bar
2. Type your question or describe what you want to build
3. The AI responds with explanations and suggestions

:::tip
Be specific in your questions! Instead of "How do I make a bot?", ask "How do I create a /ban command that checks for moderator permissions?"
:::`,

    // Ã¢â€â‚¬Ã¢â€â‚¬ Deployment Ã¢â€â‚¬Ã¢â€â‚¬
    deploymentTitle: 'Deployment',
    deploymentDesc: 'Save, deploy, and troubleshoot your bot workflows.',
    saveDeployTitle: 'Save & Deploy',
    saveDeployBody: `## Saving

Click the **Save** button (or Ctrl + S) to save your workflow. This stores your nodes, connections, and configurations.

## Deploying

Click the **Deploy** button to push your workflow to your live bot:

1. The bot rebuilds automatically with your latest changes
2. It restarts and reconnects to Discord
3. Your new workflows are active

## What\'s the difference?

- **Save** Ã¢â‚¬â€ saves your work but doesn\'t affect the running bot
- **Deploy** Ã¢â‚¬â€ pushes saved changes to the live bot

:::tip
Save frequently during editing! Deploy only when you\'re ready to go live with your changes.
:::

:::warning
Deploying restarts the bot. There will be a brief moment where the bot is offline (usually less than 10 seconds).
:::`,

    collaborationTitle: 'Collaboration & Sharing',
    collaborationBody: `## Sharing workflows

You can share workflows with other DisFlow users:

1. **Export** your workflow as JSON
2. Send the file to your collaborator
3. They **Import** it into their editor

## Team features

- **Members page** Ã¢â‚¬â€ invite team members to manage your bots
- **Role-based access** Ã¢â‚¬â€ assign editor or viewer roles
- **Activity log** Ã¢â‚¬â€ see who made changes and when

:::info
Team collaboration features may vary depending on your subscription plan.
:::`,

    troubleshootingTitle: 'Troubleshooting',
    troubleshootingBody: `## Common issues

### Bot doesn\'t come online
- Check that your **token** is correct and not expired
- Verify the required **intents** are enabled
- Ensure the bot was **invited** to your server

### Slash commands don\'t appear
- Discord caches commands Ã¢â‚¬â€ wait up to **1 hour** for new commands
- Check that the bot has the **applications.commands** scope
- Verify the command name doesn\'t conflict with other bots

### Bot doesn\'t respond
- Check the **Console** (bottom bar) for error messages
- Verify all nodes are **connected** correctly
- Ensure required configuration fields are filled
- Check **permission** settings in Discord

### Workflow errors
- Open the **Console** to see detailed error logs
- Check for disconnected nodes
- Verify variable names are spelled correctly
- Ensure database tables exist before querying them

:::tip
The Console is your best debugging tool! It shows real-time logs of everything your bot does. Open it from the bottom bar of the Workflow Editor.
:::

## Still stuck?

- Check the **Discord** support server for community help
- Browse this documentation for detailed guides
- Use the **AI Chat** assistant in the editor`,
  },
};

export default te;