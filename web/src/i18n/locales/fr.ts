import type { TranslationKeys } from '../keys';

const fr: TranslationKeys = {
  common: {
    save: 'Enregistrer',
    saved: 'Enregistré',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    add: 'Ajouter',
    close: 'Fermer',
    refresh: 'Actualiser',
    retry: 'Réessayer',
    loading: 'Chargement…',
    error: 'Erreur',
    success: 'Succès',
    name: 'Nom',
    status: 'Statut',
    type: 'Type',
    actions: 'Actions',
    back: 'Retour',
    or: 'ou',
    none: 'Aucun',
    copy: 'Copier',
    copied: 'Copié !',
  },

  sidebar: {
    instances: 'Instances',
    databases: 'Bases de données',
    settings: 'Paramètres',
    logout: 'Se déconnecter',
    expand: 'Étendre',
    collapse: 'Réduire',
    partner: 'Partenaire',
  
  },

  dashboard: {
    title: 'Dashboard',
    instances: 'Instances',
    newInstance: 'Nouvelle instance',
    total: 'Total',
    totalDesc: 'instances créées',
    active: 'Actives',
    activeDesc: 'en cours d\'exécution',
    errors: 'Erreurs',
    stopped: 'Arrêtées',
    errorsDesc: 'instance(s) en erreur',
    stoppedDesc: 'hors-ligne',
    yourInstances: 'Vos instances',
    noInstances: 'Aucune instance',
    noInstancesDesc: 'Créez votre première instance pour commencer à construire un bot Discord.',
    createInstance: 'Créer une instance',
    viewInstance: 'Voir l\'instance',
    start: 'Démarrer',
    stop: 'Arrêter',
    modify: 'Modifier',
    deleteConfirm: 'Supprimer cette instance ?',
    workflow: 'Workflow',
    executionChart: 'Activité d\'exécution',
    executionChartDesc: 'Exécutions de workflows dans le temps',
    last7Days: '7 derniers jours',
    last30Days: '30 derniers jours',
    completed: 'Terminées',
    failed: 'Échouées',
    executions: 'Exécutions',
    activityFeed: 'Activité récente',
    activityFeedDesc: 'Derniers événements de vos instances',
    noActivity: 'Aucune activité',
    noActivityDesc: 'Démarrez une instance pour voir l\'activité ici.',
    executionCompleted: 'Exécution du workflow terminée',
    executionFailed: 'Exécution du workflow échouée',
    executionRunning: 'Exécution du workflow démarrée',
    botStarted: 'Instance démarrée',
    botStopped: 'Instance arrêtée',
    botErrored: 'Erreur d\'instance',
    timeAgo: 'il y a',
    errorRate: 'Taux d\'erreur',
    errorRateDesc: 'Exécutions échouées sur le total',
    totalErrors: 'Total erreurs',
    totalExecutions: 'Total exécutions',
    noErrors: 'Aucune erreur',
    resourceUsage: 'Ressources',
    cpu: 'CPU',
    memory: 'Mémoire',
    network: 'Réseau',
    notRunning: 'Non démarré',
    quickDeploy: 'Déploiement rapide',
    quickDeployDesc: 'Déployez vos dernières modifications',
    lastModified: 'Dernière modification',
    deploy: 'Déployer',
    noWorkflows: 'Aucun workflow',
    noWorkflowsDesc: 'Créez un workflow pour déployer.',
    uptime: 'Temps d\'activité',
    uptimeDesc: 'Temps depuis le dernier démarrage',
    since: 'depuis',
    filterAll: 'Tous',
    filterRunning: 'En cours',
    filterStopped: 'Arrêtés',
    filterError: 'Erreur',
    searchPlaceholder: 'Rechercher des instances...',
    workflows: 'Workflows',
    totalWorkflows: 'workflows au total',
    totalExecs: 'exécutions au total',
    runningExecs: 'en cours maintenant',
    statusBreakdown: 'Répartition des statuts',
    sortName: 'Nom',
    sortDate: 'Date',
    sortStatus: 'Statut',
    viewGrid: 'Grille',
    viewList: 'Liste',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Tout désélectionner',
    startSelected: 'Démarrer la sélection',
    stopSelected: 'Arrêter la sélection',
    deleteSelected: 'Supprimer la sélection',
    selected: 'sélectionné(s)',
    errorBanner: 'bot(s) en erreur — voir les détails',
    errorBannerAction: 'Voir',
    toastStarted: 'Instance démarrée avec succès',
    toastStopped: 'Instance arrêtée avec succès',
    toastDeleted: 'Instance supprimée avec succès',
    toastCreated: 'Instance créée avec succès',
    toastError: 'L\'action a échoué',
  },

  status: {
    idle: 'Idle',
    running: 'Actif',
    stopped: 'Arrêté',
    error: 'Erreur',
    online: 'En ligne',
    offline: 'Hors ligne',
    nonexistent: 'Inexistant',
    pending: 'En attente',
    accepted: 'Accepté',
  },

  instance: {
    restart: 'Redémarrer',
    restarting: 'Redémarrage…',
    stopping: 'Arrêt…',
    starting: 'Démarrage…',
    container: 'Container',
    port: 'Port',
    errorsLogs: 'Erreurs (logs)',
    commandsDetected: 'Commandes détectées',
    console: 'Console',
    activity: 'Activité',
    refreshLogs: 'Rafraîchir les logs',
    clear: 'Effacer',
    autoScroll: 'Auto-scroll',
    waitingLogs: 'En attente de logs…',
    botNotActive: 'Le bot n\'est pas actif. Démarrez-le pour voir les logs.',
    info: 'Informations',
    createdAt: 'Créé le',
    logSummary: 'Résumé des logs',
    warn: 'Warn',
    debug: 'Debug',
    errorsWarn: 'Erreurs / Warn',
    lines: 'lignes',
    uptime: 'Temps d\'activité',
    cpu: 'CPU',
    memory: 'Mémoire',
    network: 'Réseau',
    pids: 'Processus',
    live: 'EN DIRECT',
    offline: 'HORS LIGNE',
    filterAll: 'Tout',
    filterErrors: 'Erreurs',
    filterWarns: 'Avertissements',
    filterInfo: 'Info',
    filterDebug: 'Debug',
    searchLogs: 'Rechercher dans les logs...',
    quickActions: 'Actions rapides',
    openWorkflow: 'Ouvrir le workflow',
    viewDatabase: 'Voir la base de données',
    purgeLogs: 'Purger les logs',
    noResourceData: 'Aucune donnée de ressources',
    since: 'depuis',
    resourceHistory: 'Historique des ressources',
    notRunning: 'Non démarré',
    dbStatus: 'Base de données',
    dbRunning: 'En marche',
    dbStopped: 'Arrêtée',
    dbTables: 'Tables',
    containerId: 'ID Conteneur',
    exportLogs: 'Exporter',
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    showingLines: '{count} / {total} lignes affichées',
    showTimestamps: 'Afficher les timestamps',
    hideTimestamps: 'Masquer les timestamps',
    rename: 'Renommer',
    renameSuccess: 'Bot renommé avec succès',
    configuration: 'Configuration',
    discordToken: 'Token',
    dbPort: 'Port DB',
    executions: 'Exécutions',
    noExecutions: 'Aucune exécution',
    pollingActive: 'Surveillance en direct active',
    highUsage: 'Utilisation élevée',
  },

  databases: {
    title: 'Bases de données',
    description: 'Chaque instance embarque MariaDB dans son conteneur Docker. Gérez les credentials et visualisez vos données.',
    noInstances: 'Aucune instance trouvée',
    noInstancesDesc: 'Créez d\'abord un bot depuis la page Instances.',
    goToInstances: 'Aller aux Instances',
    instanceCol: 'Instance',
    engine: 'Moteur',
    containerPort: 'Conteneur / Port',
    dbStatus: 'Statut DB',
    openViewer: 'Ouvrir le visualiseur',
    purgeAll: 'Purger toutes les données',
    credentials: 'Identifiants de connexion',
    host: 'Hôte',
    base: 'Base',
    user: 'User',
    password: 'Password',
    purgeConfirm: 'Supprimer toutes les tables ?',
    purged: 'Base de données purgée.',
    purge: 'Purger',
  },

  dbViewer: {
    tables: 'Tables',
    noTables: 'Aucune table',
    createTable: 'Créer une table',
    selectTable: 'Sélectionnez une table dans la barre latérale',
    newTable: 'Nouvelle table',
    addRow: 'Ajouter une ligne',
    data: 'Données',
    structure: 'Structure',
    sql: 'SQL',
    tableName: 'Nom de la table',
    tableNamePlaceholder: 'ex: users',
    columns: 'Colonnes',
    tableNameRequired: 'Le nom de la table est requis.',
    columnNamesRequired: 'Tous les noms de colonnes sont requis.',
    createError: 'Erreur lors de la création.',
    newColumn: 'Nouvelle colonne',
    defaultOpt: 'Défaut (opt.)',
    nameRequired: 'Nom requis',
    noData: 'Aucune donnée',
    insertRow: 'Insérer une ligne',
    insertInto: 'Insérer une ligne dans',
    editRowIn: 'Modifier une ligne dans',
    noPrimaryKey: 'Aucune clé primaire trouvée.',
    column: 'Colonne',
    null_: 'Null',
    key: 'Clé',
    default_: 'Défaut',
    extra: 'Extra',
    deleteColumn: 'Supprimer la colonne',
    addColumn: 'Ajouter une colonne',
    dropTable: 'Supprimer la table',
    deleteRowWhere: 'Supprimer la ligne où',
    dropTableConfirm: 'Supprimer la table et toutes ses données ?',
    dropColumnConfirm: 'Supprimer la colonne',
    page: 'Page',
    dbUnavailable: 'Base de données inaccessible',
    dbUnavailableDesc: 'La base de données du bot n\'est pas accessible. Deux causes possibles :',
    dbUnavailableCause1: 'Le bot n\'est pas démarré — démarrez-le depuis le Dashboard.',
    dbUnavailableCause2: 'Le conteneur a été créé avant la mise à jour MySQL intégrée — supprimez et recréez le bot pour réinitialiser son conteneur.',
    confirmAction: 'Confirmer l\'action',
    operationSuccess: 'Opération réussie.',
    columnAdded: 'Colonne ajoutée.',
    rowInserted: 'Ligne insérée.',
    rowUpdated: 'Ligne mise à jour.',
    tableCreated: 'Table créée.',
    sqlRunner: 'SQL Runner',
    execute: 'Exécuter',
    ctrlEnter: 'Ctrl+Enter pour exécuter',
    noResults: 'Aucun résultat.',
    rowsAffected: 'ligne(s)',
    linesAffected: 'ligne(s) affectée(s)',
    insertId: 'Insert ID',
  },

  settings: {
    title: 'Paramètres',
    general: 'Général',
    subscription: 'Abonnement',
    notifications: 'Notifications',
    profile: 'Profil',
    profileDesc: 'Informations de votre compte.',
    memberSince: 'Membre depuis',
    discordLinked: 'Discord lié',
    discordNotLinked: 'Discord non lié',
    linkDiscord: 'Lier Discord',
    linkDiscordDesc: 'Liez votre compte Discord (doit utiliser le même e-mail)',
    unlinkDiscord: 'Délier le compte Discord',
    discordLinkSuccess: 'Compte Discord lié avec succès !',
    discordUnlinkSuccess: 'Compte Discord délié avec succès.',
    discordLinkFailed: 'Échec de la liaison du compte Discord. Veuillez réessayer.',
    discordEmailMismatch: 'L\'e-mail du compte Discord ne correspond pas à votre e-mail enregistré.',
    discordAlreadyLinked: 'Ce compte Discord est déjà lié à un autre utilisateur.',
    planFree: 'Plan Free',
    editProfile: 'Modifier le profil',
    instanceDefaults: 'Paramètres des nouvelles instances',
    instanceDefaultsDesc: 'Appliqués automatiquement lors de la création d\'une nouvelle instance.',
    instanceDefaultsBanner: 'Ces paramètres définissent la langue et le thème appliqués à chaque nouvelle instance créée. Vous pouvez les modifier par instance après création.',
    defaultLanguage: 'Langue par défaut',
    defaultTheme: 'Thème par défaut',
    themeDark: 'Sombre',
    themeDarkDesc: 'Noir & gris',
    themeLight: 'Clair',
    themeLightDesc: 'Blanc & gris',
    security: 'Sécurité',
    securityDesc: 'Gestion de votre mot de passe et des accès.',
    changePassword: 'Changer le mot de passe',
    changePasswordDesc: 'Modifier votre mot de passe de connexion',
    currentPlan: 'Plan actuel',
    freeAutoRenew: 'Gratuit · Renouvellement automatique',
    botInstances3: '3 instances de bot',
    workflows5: '5 workflows par bot',
    integratedDb: 'Base de données intégrée (MySQL)',
    realtimeLogs: 'Logs en temps réel',
    communitySupport: 'Support communautaire',
    unlimitedInstances: 'Instances illimitées',
    unlimitedWorkflows: 'Workflows illimités',
    prioritySupport: 'Support prioritaire',
    customDomain: 'Domaine personnalisé',
    proTitle: 'DisFlow Pro',
    proDesc: 'Tout ce dont vous avez besoin pour des bots professionnels.',
    multipleDbs: 'Bases de données multiples',
    prioritySupport247: 'Support prioritaire 24/7',
    advancedAnalytics: 'Analytiques avancées',
    upgradePro: 'Passer à Pro',
    emailNotifications: 'Notifications par e-mail',
    emailNotificationsDesc: 'Choisissez les événements pour lesquels vous souhaitez être notifié.',
    notifStartStop: 'Démarrage / Arrêt d\'une instance',
    notifStartStopDesc: 'Recevoir un e-mail à chaque changement de statut de vos bots.',
    notifErrors: 'Erreurs critiques',
    notifErrorsDesc: 'Être alerté lorsqu\'un bot rencontre une erreur bloquante.',
    notifWeekly: 'Rapport hebdomadaire',
    notifWeeklyDesc: 'Un résumé de l\'activité de vos bots chaque lundi.',
    notifMarketing: 'Offres et nouveautés',
    notifMarketingDesc: 'Restez informé des nouvelles fonctionnalités et promotions.',
    autoSaved: 'Les modifications sont sauvegardées automatiquement.',
    planPro: 'Pro',
    planBusiness: 'Business',
    priceMonth: '/mois',
    currentPlanLabel: 'Plan actuel',
    active: 'Actif',
    cancelPending: 'Annulation en fin de période',
    manageSubscription: 'Gérer l\'abonnement',
    changePlan: 'Changer de plan',
    usage: 'Utilisation',
    bots: 'Bots',
    commandsPerBot: 'Commandes par bot',
    eventsPerBot: 'Événements par bot',
    dbSize: 'Taille base de données',
    membersPerBot: 'membres/bot',
    extraSeat: 'siège suppl./mois',
    aiCredits: 'Crédits IA',
    unlimited: 'Illimité',
    usedOf: 'utilisé(s) sur',
    upgradeNow: 'Passer au plan supérieur',
    downgradeFree: 'Revenir au plan gratuit',
    businessTitle: 'Business',
    businessDesc: 'Pour les équipes et projets ambitieux. Tout illimité avec support prioritaire.',
    creditResetsOn: 'Rechargement le',
    cancelInfo: 'Votre abonnement restera actif jusqu\'à la fin de la période en cours.',
    priceYear: '/an',
    monthly: 'Mensuel',
    annual: 'Annuel',
    savePercent: '-17%',
    annualSaving: 'Économisez vs.',
  },

  members: {
    title: 'Membres',
    backToDashboard: 'Retour au dashboard',
    owner: 'Propriétaire',
    admin: 'Admin',
    editor: 'Éditeur',
    viewer: 'Lecteur',
    inviteCollaborator: 'Inviter un collaborateur',
    invite: 'Inviter',
    sent: 'Envoyé !',
    readOnly: 'Lecture seule',
    canEditWorkflow: 'Peut modifier le workflow',
    fullManagement: 'Gestion complète + invitations',
    collaborators: 'Collaborateurs',
    hierarchy: 'Hiérarchie',
    chooseNewRole: 'Choisissez un nouveau rôle',
    changeRole: 'Changer le rôle',
    removeFromWorkflow: 'Retirer du workflow',
    removeConfirm: 'Retirer du workflow ?',
    noCollaborators: 'Aucun collaborateur — invitez quelqu\'un ci-dessus.',
    noWorkflowSelected: 'Aucun workflow sélectionné.',
    member: 'membre',
    members_: 'membres',
  },

  botModal: {
    editInstance: 'Modifier l\'instance',
    newInstance: 'Nouvelle instance',
    instanceName: 'Nom de l\'instance',
    discordToken: 'Token Discord',
    namePlaceholder: 'Mon super bot',
    tokenPlaceholder: 'MTAw...',
    tokenHelp: 'Obtenez votre token sur le Discord Developer Portal',
    tokenUpdateHint: 'Laisser vide pour conserver le token actuel',
    tokenUpdateHelp: 'Laissez vide pour conserver le token actuel. En cas de modification, le conteneur sera automatiquement redéployé.',
    settingsApplied: 'Paramètres appliqués :',
    createInstance: 'Créer l\'instance',
    update: 'Mettre à jour',
    saving: 'Sauvegarde...',
    nameRequired: 'Le nom du bot est requis',
    tokenRequired: 'Le token Discord est requis pour les nouveaux bots',
    saveFailed: 'Échec de la sauvegarde :',
  },

  auth: {
    login: 'Connexion',
    loginWelcome: 'Content de vous revoir 👋',
    email: 'Email',
    password: 'Mot de passe',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '••••••••',
    continueDiscord: 'Continuer avec Discord',
    signIn: 'Se connecter',
    noAccount: 'Pas encore de compte ?',
    signUp: 'S\'inscrire',
    register: 'Créer un compte',
    registerSubtitle: 'Commencez à construire vos bots aujourd\'hui',
    confirmPassword: 'Confirmer le mot de passe',
    minChars: 'Min. 8 caractères',
    registerDiscord: 'S\'inscrire avec Discord',
    createAccount: 'Créer mon compte',
    hasAccount: 'Déjà un compte ?',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    unknownError: 'Erreur inconnue',
    loginError: 'Erreur de connexion',
    discordFailed: 'Connexion Discord échouée, veuillez réessayer.',
    discordCancelled: 'Connexion Discord annulée.',
    brandTagline: 'Construisez des bots Discord puissants grâce à un éditeur visuel. Sans écrire une seule ligne de code.',
    feature1: 'Éditeur workflow drag & drop',
    feature2: 'Toutes les fonctions DiscordJS v14',
    feature3: 'Déploiement en un clic',
  },

  landing: {
    dashboard: 'Dashboard',
    login: 'Connexion',
    getStarted: 'Commencer',
    logoutBtn: 'Déconnexion',
    heroTitle: 'Automation Discord — No-Code',
    heroSubtitle: 'Créez des bots Discord sans écrire une ligne',
    heroDesc: 'Éditeur de workflow visuel, toutes les actions DiscordJS v14, déploiement instantané. De la conception au live en quelques minutes.',
    startFree: 'Démarrer gratuitement',
    viewDemo: 'Voir la démo',
    freeToStart: 'Gratuit pour démarrer',
    noCardRequired: 'Aucune carte requise',
    oneClickDeploy: 'Déploiement en 1 clic',
    dualTitle: 'Un design pour chaque moment',
    dualSubtitle: 'Premium UI · Dual Mode',
    dualDesc: 'Basculez entre le mode clair épuré et le mode sombre immersif — les deux taillés pour l\'excellence.',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    lightDesc: 'Crisp & minimal — designed for focus',
    darkDesc: 'Sleek & immersive — built for power users',
    statUsers: 'Utilisateurs actifs',
    statBots: 'Bots déployés',
    statUptime: 'Uptime garanti',
    statRating: 'Note moyenne',
    featuresLabel: 'Fonctionnalités',
    featuresTitle: 'Tout ce qu\'il vous faut',
    featuresSub: 'Une plateforme complète pour concevoir, tester et déployer vos bots Discord.',
    feat1Title: 'Éditeur visuel drag & drop',
    feat1Desc: 'Créez des workflows complexes visuellement. Conditions, boucles, délais, branchements — tout est là.',
    feat2Title: 'DiscordJS v14 complet',
    feat2Desc: 'Accédez à toutes les fonctionnalités de DiscordJS : messages, rôles, modération, slash commands, événements.',
    feat3Title: 'Sécurisé & isolé',
    feat3Desc: 'Chaque bot tourne dans son propre conteneur Docker avec une isolation et une sécurité totales.',
    feat4Title: 'Commandes Slash intelligentes',
    feat4Desc: 'Définissez des commandes slash visuellement avec paramètres, permissions et auto-complétion — sans code inutile.',
    popular: 'Populaire',
    stepsLabel: 'Processus',
    stepsTitle: 'En 3 étapes simples',
    stepsSub: 'De l\'idée au bot Discord en ligne, sans toucher à une seule ligne de code.',
    step1Title: 'Créez un bot',
    step1Desc: 'Enregistrez votre token Discord et donnez un nom à votre instance. Prêt en 60 secondes.',
    step2Title: 'Concevez le workflow',
    step2Desc: 'Ajoutez des triggers, conditions et actions depuis la bibliothèque complète de nœuds.',
    step3Title: 'Déployez en un clic',
    step3Desc: 'Votre bot est en ligne et exécute vos workflows en temps réel, avec logs intégrés.',
    ctaTitle: 'Prêt à construire ?',
    ctaDesc: 'Rejoignez des milliers de créateurs qui automatisent leurs serveurs Discord sans écrire de code.',
    ctaButton: 'Créer un compte gratuit',
    footer: '© 2026 DisFlow · Tous droits réservés',
    navBenefits: 'Avantages',
    navTestimonials: 'Témoignages',
    navPricing: 'Tarifs',
    basedOnReviews: 'basé sur 2 400+ avis',
    trustedBy: 'Utilisé par des communautés du monde entier',
    benefitsLabel: 'Avantages',
    benefitsTitle: 'Pourquoi les créateurs choisissent DisFlow',
    benefitsSub: 'Tout ce qu\'il faut pour passer de l\'idée au bot Discord, sans aucune complexité.',
    templatesLabel: 'Templates',
    templatesTitle: '100+ Templates prêts à l\'emploi',
    templatesDesc: 'Parcourez une bibliothèque de workflows pré-construits. Modération, accueil, tickets et plus encore.',
    tplModeration: 'Modération',
    tplWelcome: 'Bienvenue',
    tplTickets: 'Tickets',
    tplAutoRole: 'Auto-rôle',
    communityLabel: 'Communauté',
    communityTitle: 'Rejoignez notre communauté',
    communityDesc: 'Partagez vos workflows, obtenez de l\'aide et collaborez avec des milliers de créateurs de bots.',
    communityMembers: '4 200+ membres',
    joinDiscord: 'Rejoindre Discord',
    previewLabel: 'Aperçu en direct',
    previewTitle: 'Demandez à DisFlow...',
    previewChat1: 'Je peux vous aider à créer n\'importe quel workflow de bot. Décrivez simplement ce dont vous avez besoin !',
    previewChat2: 'Workflow de bienvenue configuré !',
    previewPlaceholder: 'Tapez une commande...',
    advantagesLabel: 'Avantages',
    advantagesTitle: 'Conçu pour la performance et la simplicité',
    kb1Title: 'Zéro code requis',
    kb1Desc: 'Créez des bots complexes avec une interface visuelle drag & drop. Aucune connaissance en programmation nécessaire.',
    kb2Title: 'Déploiement instantané',
    kb2Desc: 'Un clic pour déployer. Votre bot est en ligne immédiatement dans un conteneur Docker isolé.',
    kb3Title: '99,9% de disponibilité',
    kb3Desc: 'Une infrastructure de qualité professionnelle garantit que vos bots restent en ligne 24h/24.',
    kb4Title: 'Évolution sans limites',
    kb4Desc: 'D\'un seul serveur à des milliers — DisFlow évolue automatiquement avec votre communauté.',
    testimonialsLabel: 'Témoignages',
    testimonialsTitle: 'Ce qu\'en disent nos utilisateurs',
    test1Quote: 'DisFlow a transformé la gestion de notre communauté Discord. Nous avons construit tout notre système de modération sans écrire une seule ligne de code.',
    test1Name: 'Alex R.',
    test1Role: 'Community Manager',
    test2Quote: 'L\'éditeur de workflow visuel est incroyablement intuitif. J\'avais un bot d\'accueil et un système d\'auto-rôle en quelques minutes.',
    test2Name: 'Sarah K.',
    test2Role: 'Propriétaire de serveur',
    test3Quote: 'En tant que développeur, j\'apprécie la puissance sous le capot. Accès complet à DiscordJS v14 via une interface visuelle — brillant.',
    test3Name: 'Marcus T.',
    test3Role: 'Développeur',
    test4Quote: 'Nous avons remplacé trois bots séparés par un seul workflow DisFlow. Plus facile à maintenir, à faire évoluer, et bien plus fiable.',
    test4Name: 'Julien P.',
    test4Role: 'Fondateur de startup',
    pricingLabel: 'Tarifs',
    pricingTitle: 'Choisissez le plan adapté à vos objectifs',
    pricingSub: 'Choisissez le plan qui correspond à vos besoins et qui évolue avec votre communauté.',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    planFree: 'Gratuit',
    planPro: 'Pro',
    planBusiness: 'Business',
    planSuffix: 'Plan',
    cancelAnytime: 'Résiliable à tout moment.',
    priceFeat1Bot: '1 instance de bot',
    priceFeatBasicLib: 'Bibliothèque de nœuds basique',
    priceFeat100Exec: '100 exécutions/jour',
    priceFeatCommunity: 'Support communautaire',
    priceFeatStdLogs: 'Logs standard',
    priceFeat5Bots: '5 instances de bot',
    priceFeatFullLib: 'Bibliothèque complète',
    priceFeatUnlimited: 'Exécutions illimitées',
    priceFeatPriority: 'Support prioritaire',
    priceFeatAnalytics: 'Analytiques avancées',
    priceFeatUnlimitedBots: 'Bots illimités',
    priceFeatEverythingPro: 'Tout le plan Pro inclus',
    priceFeatTeam: 'Collaboration en équipe',
    priceFeatAdmin: 'Dashboard admin',
    priceFeatApi: 'Accès API & webhooks',
    billedYearly: '/mois facturé annuellement',
    faqLabel: 'FAQ',
    faqTitle: 'Questions fréquentes',
    faq1Q: 'Qu\'est-ce que DisFlow ?',
    faq1A: 'DisFlow est une plateforme no-code qui vous permet de créer, déployer et gérer des bots Discord avec un éditeur de workflow visuel par glisser-déposer — aucune programmation requise.',
    faq2Q: 'Ai-je besoin de savoir coder ?',
    faq2A: 'Pas du tout. DisFlow fournit une interface visuelle complète avec des nœuds pré-construits pour toutes les actions Discord. Si vous savez utiliser un organigramme, vous pouvez créer un bot.',
    faq3Q: 'Comment fonctionne le déploiement ?',
    faq3A: 'Chaque bot tourne dans son propre conteneur Docker isolé. Quand vous cliquez sur Déployer, votre workflow est packagé et lancé automatiquement — le processus prend moins de 30 secondes.',
    faq4Q: 'Mes données sont-elles sécurisées ?',
    faq4A: 'Oui. Tous les tokens sont chiffrés au repos, chaque conteneur de bot est entièrement isolé et nous suivons des pratiques de sécurité strictes. Vos données ne sont jamais partagées ni exposées.',
    faq5Q: 'Puis-je collaborer avec mon équipe ?',
    faq5A: 'Absolument. Les plans équipe incluent la collaboration en temps réel, des espaces de travail partagés, des permissions basées sur les rôles et un dashboard admin centralisé.',
    faq6Q: 'Quelles fonctionnalités Discord sont supportées ?',
    faq6A: 'DisFlow couvre l\'API complète de DiscordJS v14 — messages, embeds, réactions, rôles, modération, commandes slash, modals, boutons, menus de sélection, événements vocaux et bien plus encore.',
    previewBotName: 'Mon Bot de Modération',
    previewSave: 'Sauvegarder',
    previewDeploy: 'Déployer',
    previewAddNode: 'Ajouter un nœud',
    previewSearchNodes: 'Rechercher des nœuds...',
    nodeCoreBot: 'Core Bot',
    nodeCommand: 'Commande',
    nodeCondition: 'Condition',
    nodeEvent: 'Événement',
    nodeSendMsg: 'Envoyer msg',
    nodeKick: 'Expulser',
    nodeTrue: 'Vrai',
    nodeFalse: 'Faux',
    catHandlers: 'Handlers',
    catHandlersDesc: 'Commande slash ou événement Discord',
    catBot: 'Bot',
    catBotDesc: 'Présence, avatar et surnom du bot',
    catActions: 'Actions',
    catActionsDesc: 'Envoyer, modifier ou supprimer des messages',
    catUsers: 'Utilisateurs',
    catUsersDesc: 'Messages privés et gestion des utilisateurs',
    catInteractions: 'Interactions',
    catInteractionsDesc: 'Boutons, menus déroulants et modals',
    catGuild: 'Serveur',
    catGuildDesc: 'Rôles, salons, fils et réactions',
    catVoice: 'Vocal',
    catVoiceDesc: 'Salons vocaux et lecture audio',
    catModeration: 'Modération',
    catModerationDesc: 'Expulsion, bannissement et timeout',
    catCanvas: 'Canvas',
    catCanvasDesc: 'Images et cartes graphiques',
    catDatabase: 'Base de données',
    catDatabaseDesc: 'Lire et écrire en base de données',
    catLogic: 'Logique',
    catLogicDesc: 'Conditions, boucles et variables',
    catCoreBotDesc: 'Nœud racine du workflow',
    footerDesc: 'Créez des bots Discord puissants sans écrire de code. Workflows visuels, déploiement instantané, contrôle total.',
    footerNav: 'Navigation',
    footerPages: 'Pages',
    footerSocials: 'Réseaux sociaux',
    footerHome: 'Accueil',
  },

  workflow: {
    loadingWorkflow: 'Chargement du workflow…',
    workflowNamePlaceholder: 'Nom du workflow…',
    unsavedChanges: 'Modifications non sauvegardées',
    descriptionPlaceholder: 'Description (optionnel)…',
    save: 'Sauvegarder',
    deploy: 'Déployer',
    instancesBreadcrumb: 'Instances',
    aiModified: 'Workflow modifié par l\'IA',
    aiReverted: 'Modification IA annulée',
    templateInserted: 'Template inséré',
    enterWorkflowName: 'Veuillez entrer un nom de workflow',
    workflowSaved: 'Workflow sauvegardé avec succès !',
    loadFailed: 'Échec du chargement du workflow',
    saveFailed: 'Échec de la sauvegarde du workflow',
    deployFailed: 'Échec du déploiement du workflow',
    savedRebuilding: 'Workflow sauvegardé — le bot est en cours de reconstruction (~30s).',
    noBotLinked: 'Workflow sauvegardé. Aucun bot lié — assignez-en un depuis le Dashboard.',
    deploySuccess: 'Workflow déployé avec succès !',
    collaboratorsOnline: 'en ligne',
    remoteUserSaved: 'Un collaborateur a sauvegardé le workflow.',
    iaChat: 'IA Chat',
    console: 'Console',
    chat: 'Chat',
    split: 'Split',
    topBottom: 'Haut & Bas',
    leftRight: 'Gauche & Droite',
    lines: 'lignes',
    clear: 'Effacer',
    waitingLogs: 'En attente des logs du bot…',
    openNodes: 'Ouvrir les nœuds',
    collapse: 'Réduire',
    addNode: 'Ajouter un nœud',
    searchNodesPlaceholder: 'Rechercher des nœuds...',
    nodeCount: 'nœuds',
    noResults: 'Aucun résultat pour',
    dragOrClick: 'Glisser ou cliquer pour ajouter',
    workflowTitle: 'Workflow',
    expand: 'Développer',
    languages: 'Langues',
    themes: 'Thèmes',
    canvas: 'Canvas',
    dark: 'Sombre',
    light: 'Clair',
    system: 'Système',
    accentLabel: 'Accent :',
    snapToGrid: 'Snap to Grid',
    snapToGridHint: 'Aligner sur la grille',
    minimap: 'Minimap',
    minimapHint: 'Vue miniature en bas à droite',
    autoSave: 'Auto-Save',
    autoSaveHint: 'Sauvegarde automatique (30 s)',
    notifications: 'Notifications',
    saveNotif: 'Sauvegarde',
    errors: 'Erreurs',
    browserNotif: 'Navigateur',
    browserNotifHint: 'Notifications système',
    preferences: 'Préférences',
    confirmDelete: 'Confirmer supp.',
    confirmDeleteHint: 'Demander avant de supprimer',
    tooltips: 'Infobulles',
    tooltipsHint: 'Afficher les aides',
    compactNodes: 'Nœuds compacts',
    compactNodesHint: 'Réduire la taille des nœuds',
    settings: 'Paramètres',
    help: 'Aide',
    helpDesc: 'Guides et documentation',
    gettingStarted: 'Démarrage',
    canvasBasics: 'Bases du canvas',
    addHandler: 'Ajouter un handler',
    connectNodes: 'Connecter des nœuds',
    handlers: 'Handlers',
    commandHandler: 'Command Handler',
    eventHandler: 'Event Handler',
    permissionsRoles: 'Permissions & rôles',
    discordActions: 'Discord Actions',
    messagesEmbeds: 'Messages & embeds',
    roleManagement: 'Gestion des rôles',
    moderation: 'Modération',
    database: 'Base de données',
    sqlQuery: 'SQL Query',
    createTableHelp: 'CREATE TABLE',
    selectInsert: 'SELECT / INSERT',
    templates: 'Templates',
    templatesDesc: 'Bibliothèque de workflows',
    searchPlaceholder: 'Rechercher…',
    all: 'Tous',
    insert: 'Insérer',
    noTemplateFound: 'Aucun template trouvé',
    databases: 'Bases de données',
    databasesDesc: 'Gérer vos tables SQL',
    members: 'Membres',
    membersDesc: 'Collaborateurs du workflow',
    settingsDesc: 'Snap, minimap, auto-save…',
    catHandlersDesc: 'Déclenchez votre workflow depuis une commande slash ou un événement Discord',
    catBotDesc: 'Manage the bot presence, avatar and nickname',
    catActionsDesc: 'Envoyer, modifier ou supprimer des messages dans les salons',
    catUsersDesc: 'Messages privés, informations et gestion des utilisateurs',
    catInteractionsDesc: 'Buttons, dropdowns, modals and interaction handlers',
    catGuildDesc: 'Rôles, salons, fils, réactions, épingles et invitations',
    catVoiceDesc: 'Salons vocaux, lecture audio et gestion des membres connectés',
    catModsDesc: 'Expulsion, bannissement, timeout et gestion des surnoms',
    catCanvasDesc: 'Générer des images et des cartes graphiques personnalisées',
    catDatabaseDesc: 'Lire et écrire dans une base de données SQL',
    catLogicDesc: 'Conditions, boucles, variables, transformations, HTTP et webhooks',
    catCoreDesc: 'Nœud racine du workflow — configurez votre bot Discord',
    catModsLabel: 'Modération',
    nodeDescCoreBot: 'Point de départ de votre workflow',
    nodeDescCondition: 'Embranchement basé sur une condition',
    nodeDescDelay: 'Attendre un temps spécifié',
    nodeDescVariable: 'Stocker ou récupérer des variables',
    nodeDescForEach: 'Itérer sur chaque élément d\'une liste',
    nodeDescSwitchCase: 'Embranchement d\'exécution sur plusieurs cas',
    nodeDescRandom: 'Générer une valeur aléatoire ou choisir un élément au hasard',
    nodeDescCounter: 'Incrémenter ou décrémenter un compteur',
    nodeDescFilter: 'Filtrer les éléments d\'une liste selon une condition',
    nodeDescMathOperation: 'Effectuer des opérations arithmétiques sur des valeurs',
    nodeDescStringOperation: 'Manipuler du texte (majuscules, découpe, remplacement…)',
    nodeDescArrayOperation: 'Manipuler des tableaux : push, pop, join, sort, slice…',
    nodeDescJsonParse: 'Parser une chaîne JSON en variable',
    nodeDescJsonStringify: 'Convertir une variable en chaîne JSON',
    nodeDescTypeConvert: 'Convertir une valeur entre types (string, number, boolean…)',
    nodeDescGetDate: 'Obtenir la date et l\'heure actuelles en variables',
    nodeDescLoopWhile: 'Répéter tant qu\'une condition est vraie (max 100 itérations)',
    nodeDescHttpRequest: 'Effectuer une requête HTTP',
    nodeDescWebhook: 'Créer un endpoint webhook',
    nodeDescSendMessage: 'Envoie un message (texte, embed riche, image, fichier) dans un canal',
    nodeDescEditMessage: 'Modifier le contenu d\'un message existant',
    nodeDescDeleteMessage: 'Supprimer un message d\'un canal',
    nodeDescReplyToMessage: 'Répondre à un message existant',
    nodeDescAddRole: 'Ajouter un rôle à un membre',
    nodeDescRemoveRole: 'Retirer un rôle à un membre',
    nodeDescCreateRole: 'Créer un nouveau rôle',
    nodeDescKick: 'Expulser un membre du serveur',
    nodeDescBan: 'Bannir un membre du serveur',
    nodeDescUnban: 'Retirer le bannissement d\'un utilisateur',
    nodeDescTimeout: 'Rendre muet temporairement un membre pour une durée',
    nodeDescUnmute: 'Retire le timeout d\'un membre (démute avant la fin)',
    nodeDescBulkDeleteMessages: 'Supprime en masse plusieurs messages récents dans un salon (max 100, < 14 jours)',
    nodeDescSetNickname: 'Changer le surnom d\'un membre sur le serveur',
    nodeDescCreateChannel: 'Créer un nouveau salon textuel ou vocal',
    nodeDescDeleteChannel: 'Supprimer définitivement un salon',
    nodeDescCommandHandlerSuite: 'Enregistrer et exécuter des commandes slash Discord',
    nodeDescEventHandlerSuite: 'Déclencher des workflows sur des événements Discord',
    nodeDescSqlDatabase: 'Exécuter une requête SQL sur la base de données de l\'instance',
    nodeDescCodeExec: 'Exécute du code JavaScript personnalisé avec accès au contexte Discord',
    nodeDescCanvasCard: 'Génère une image (carte de profil, bannière…) via un builder visuel de calques',
    nodeDescJoinVoiceChannel: 'Connecte le bot à un canal vocal',
    nodeDescLeaveVoiceChannel: 'Déconnecte le bot du canal vocal actuel',
    nodeDescPlayAudio: 'Joue un fichier audio (YouTube, MP3, OGG) dans le canal vocal',
    nodeDescStopAudio: 'Arrête la lecture audio en cours',
    nodeDescMoveToVoice: 'Déplace un membre vers un canal vocal',
    nodeDescDisconnectFromVoice: 'Déconnecte un membre du canal vocal',
    nodeDescSetBotPresence: 'Modifie le statut et l\'activité du bot (fixe ou rotation)',
    nodeDescSetBotNickname: 'Change le surnom du bot dans le serveur',
    nodeDescSetBotAvatar: 'Change l\'avatar global du bot',
    nodeDescSendDM: 'Envoie un message privé à un utilisateur',
    nodeDescAddReaction: 'Ajoute une réaction emoji à un message',
    nodeDescPinMessage: 'Épingle un message dans un canal',
    nodeDescUnpinMessage: 'Désépingle un message dans un canal',
    nodeDescCreateThread: 'Crée un fil de discussion depuis un message ou un canal',
    nodeDescArchiveThread: 'Archive ou ferme un fil de discussion',
    nodeDescEditChannel: 'Modifie le nom, le topic ou le slowmode d\'un canal',
    nodeDescCreateInvite: 'Génère un lien d\'invitation pour un canal',
    nodeDescEditGuild: 'Modifie les paramètres du serveur (nom, icône, bannière, description…)',
    nodeDescEditRole: 'Modifie les propriétés d\'un rôle (nom, couleur, permissions, position…)',
    nodeDescDeleteRole: 'Supprime définitivement un rôle du serveur',
    nodeDescCreateEmoji: 'Crée un emoji personnalisé à partir d\'une URL d\'image',
    nodeDescDeleteEmoji: 'Supprime un emoji personnalisé du serveur',
    nodeDescEditEmoji: 'Renomme un emoji ou modifie ses rôles autorisés',
    nodeDescCreateSticker: 'Crée un sticker personnalisé depuis un fichier image ou Lottie',
    nodeDescDeleteSticker: 'Supprime un sticker du serveur',
    nodeDescCreateEvent: 'Crée un événement planifié dans le serveur',
    nodeDescEditEvent: 'Modifie un événement planifié (titre, description, date, image…)',
    nodeDescDeleteEvent: 'Annule et supprime un événement planifié',
    nodeDescCreateGuildWebhook: 'Crée un webhook dans un canal du serveur',
    nodeDescDeleteGuildWebhook: 'Supprime un webhook du serveur',
    nodeDescExecuteWebhook: 'Envoie un message via un webhook Discord (texte, embed, fichier)',
    nodeDescFetchAuditLog: 'Récupère les entrées du journal d\'audit du serveur',
    nodeDescFetchMembers: 'Récupère la liste des membres du serveur avec filtres optionnels',
    nodeDescServerMuteMember: 'Coupe le micro d\'un membre en vocal (server mute)',
    nodeDescServerDeafenMember: 'Assourdit un membre en vocal (server deafen)',
    nodeDescFetchUserInfo: 'Récupère les infos d\'un utilisateur et les stocke en variables',
    nodeDescSendButtons: 'Envoie un message avec des boutons cliquables',
    nodeDescSendStringSelectMenu: 'Envoie un menu déroulant avec des options textuelles',
    nodeDescSendUserSelectMenu: 'Envoie un sélecteur d\'utilisateurs',
    nodeDescSendRoleSelectMenu: 'Envoie un sélecteur de rôles',
    nodeDescSendChannelSelectMenu: 'Envoie un sélecteur de canaux',
    nodeDescSendModal: 'Affiche une fenêtre modale avec des champs de formulaire',
    nodeDescAwaitButtonClick: 'Attend le clic sur un bouton avec un timeout',
    nodeDescAwaitSelectMenu: 'Attend la sélection dans un menu déroulant avec timeout',
    nodeDescButtonInteractionHandler: 'Déclenche le workflow lorsqu\'un bouton correspondant est cliqué',
    nodeDescSelectMenuInteractionHandler: 'Déclenche le workflow lorsqu\'une option de menu est sélectionnée',
    nodeDescModalSubmitHandler: 'Déclenche le workflow lorsqu\'un formulaire modal est soumis',
    tplCatModeration: 'Modération',
    tplCatUser: 'Utilisateur',
    tplCatServer: 'Serveur',
    tplCatUtility: 'Utilitaire',
    tplModBanName: '/ban — Bannir un membre',
    tplModBanDesc: 'Commande slash qui bannit un membre avec une raison optionnelle, puis confirme dans le salon.',
    tplModKickName: '/kick — Expulser un membre',
    tplModKickDesc: 'Expulse un membre du serveur. Le membre peut revenir via invitation.',
    tplModTimeoutName: '/timeout — Mettre en sourdine',
    tplModTimeoutDesc: 'Met un membre en timeout pour une durée définie (en minutes).',
    tplModUnmuteName: '/unmute — Retirer le timeout',
    tplModUnmuteDesc: 'Retire le timeout d\'un membre avant la fin de la durée.',
    tplModWarnName: '/warn — Avertir en MP',
    tplModWarnDesc: 'Envoie un avertissement en message privé au membre, puis confirme dans le salon.',
    tplModClearName: '/clear — Supprimer des messages',
    tplModClearDesc: 'Supprime en masse jusqu\'à 100 messages dans le salon courant.',
    tplModUnbanName: '/unban — Débannir un membre',
    tplModUnbanDesc: 'Retire un ban par ID Discord.',
    tplUserInfoName: '/userinfo — Infos membre',
    tplUserInfoDesc: 'Affiche les informations d\'un membre (pseudo, rôles, date d\'arrivée…).',
    tplUserNickName: '/nick — Changer le pseudo',
    tplUserNickDesc: 'Modifie le pseudonyme d\'un membre sur le serveur.',
    tplUserAddroleName: '/addrole — Ajouter un rôle',
    tplUserAddroleDesc: 'Attribue un rôle à un membre.',
    tplUserRemroleName: '/remrole — Retirer un rôle',
    tplUserRemroleDesc: 'Retire un rôle d\'un membre.',
    tplSrvServerinfoName: '/serverinfo — Infos serveur',
    tplSrvServerinfoDesc: 'Affiche les statistiques du serveur (membres, date de création, etc.).',
    tplSrvInviteName: '/invite — Créer une invitation',
    tplSrvInviteDesc: 'Génère une invitation pour le salon courant et l\'envoie en réponse.',
    tplSrvAutomodName: 'Auto-mod — Filtre de mots',
    tplSrvAutomodDesc: 'Écoute chaque message, vérifie une condition de filtre et supprime le message si besoin.',
    tplUtilPingName: '/ping — Latence du bot',
    tplUtilPingDesc: 'Répond avec la latence du bot et de l\'API Discord.',
    tplUtilRollName: '/roll — Lancer un dé',
    tplUtilRollDesc: 'Lance un dé à N faces et affiche le résultat aléatoire.',
    tplUtilChooseName: '/choose — Choisir au hasard',
    tplUtilChooseDesc: 'Choisit aléatoirement une option parmi une liste séparée par des virgules.',
    tplUtilDelayMsgName: 'Message avec délai',
    tplUtilDelayMsgDesc: 'Envoie un premier message immédiatement, attend X secondes, puis envoie un message de suivi.',
    shortcutSave: 'Sauvegarder',
    shortcutUndo: 'Annuler',
    shortcutRedo: 'Rétablir',
    shortcutSelectAll: 'Tout sélectionner',
    shortcutCopy: 'Copier',
    shortcutPaste: 'Coller',
    shortcutCut: 'Couper',
    shortcutDuplicate: 'Dupliquer',
    shortcutDelete: 'Supprimer la sélection',
    shortcutPan: 'Déplacer le canvas',
    shortcutSelection: 'Sélection rectangle',
    shortcutMultiSelect: 'Sélection multiple',
    keyboardShortcuts: 'Raccourcis clavier',
    exportWorkflow: 'Exporter',
    importWorkflow: 'Importer',
    exportSuccess: 'Workflow exporté avec succès !',
    importSuccess: 'Workflow importé avec succès !',
    importError: 'Erreur lors de l\'import du workflow',
    importInvalidJson: 'Le fichier sélectionné n\'est pas un JSON valide.',
    importInvalidFormat: 'Format de workflow invalide.',
  },

  nodeConfig: {
    saveBtn: 'Enregistrer',
    closeBtn: 'Fermer',
    name: 'Nom',
    operation: 'Opération',
    value: 'Valeur',
    storeResultIn: 'Stocker le résultat dans',
    noteOptional: 'Note (optionnelle · markdown supporté)',
    noteDesc: 'Décrivez ce que fait ce nœud…',
    accessVia: 'Accès via',
    lastExecution: 'Dernière exécution',
    arguments_: 'Arguments',
    user: 'Utilisateur',
    server: 'Serveur',
    channel: 'Salon',
    message: 'Message',
    runtimeVars: 'Variables runtime',
    bgColor: 'Couleur de fond',
    addNotesHint: 'Ajoutez des notes ci-dessus pour voir l\'aperçu.',
    canvasPreview: 'Aperçu canvas',
    output: 'Sortie',
    define: '💾 Définir',
    deleteOp: '🗑️ Supprimer',
    currentChannel: 'Salon actuel',
    custom: 'Personnalisé',
    directId: 'ID direct',
    fromDatabase: 'Base de données',
    fetchChannelIdFromDb: 'Récupérer le channel_id depuis la DB',
    refreshBtn: 'Rafraîchir',
    noBotAssociated: 'Aucun bot associé',
    dbInaccessible: 'Base de données inaccessible',
    table: 'Table',
    selectTable: 'Sélectionner une table',
    selectColumn: 'Sélectionner une colonne',
    columnChannelId: 'Colonne contenant le Channel ID',
    whereConditions: 'Conditions WHERE',
    voiceChannel: 'Canal vocal',
    userChannel: 'Salon de l\'utilisateur',
    idVariable: 'ID / Variable',
    autoVoiceHint: 'Le bot rejoint automatiquement le canal vocal de l\'utilisateur.',
    noInputData: 'Aucune donnée d\'entrée',
    connectUpstream: 'Connectez un nœud en amont',
    availableData: 'Données disponibles',
    notExecutedYet: 'Pas encore exécuté',
    noFieldsAvailable: 'Aucun champ disponible',
    executeWorkflow: 'Exécutez le workflow pour voir les données disponibles',
    context: 'Contexte',
    discordCommonVars: 'Variables Discord communes',
    dragOrClickVar: 'Glisse dans un champ ou clique.',
    edit: 'Éditer',
    preview: 'Aperçu',
    markdown: 'Markdown',
    markdownDiscord: 'Markdown Discord',
    discordPreview: 'Aperçu Discord',
    fillFieldsPreview: 'Remplissez les champs pour voir l\'aperçu',
    codeNodeJs: 'Code Node.js',
    equals: 'est égal à (==)',
    notEquals: 'est différent de (!=)',
    greaterThan: 'supérieur à (>)',
    lessThan: 'inférieur à (<)',
    greaterOrEqual: 'supérieur ou égal (>=)',
    lessOrEqual: 'inférieur ou égal (<=)',
    contains: 'contient',
    notContains: 'ne contient pas',
    startsWith: 'commence par',
    endsWith: 'finit par',
    matchesRegex: 'correspond au regex',
    operator: 'Opérateur',
    rightValue: 'Valeur droite',
    duration: 'Durée',
    unit: 'Unité',
    milliseconds: 'Millisecondes',
    seconds: 'Secondes',
    minutes: 'Minutes',
    hours: 'Heures',
    increment: 'Incrémenter',
    decrement: 'Décrémenter',
    reset: 'Réinitialiser',
    valueToTest: 'Valeur à tester',
    case_: 'Cas',
    addCase: 'Ajouter un cas',
    forEach: 'Pour chaque élément',
    sourceVariable: 'Variable source',
    currentElementVar: 'Variable élément courant',
    currentElementValue: 'Valeur de l\'élément courant dans…',
    loopCondition: 'Condition de boucle',
    leftValue: 'Valeur gauche',
    maxIterations: 'Iterations max',
    usageWarning: '⚠️ Utilisation',
    loopInstructions: 'Connectez la sortie Boucle vers le bloc à répéter… La sortie Terminé continue quand la condition est fausse ou que le max est atteint.',
    filterList: 'Filtrer une liste',
    propertyToTest: 'Propriété à tester',
    emptyTestElement: '(vide = tester l\'élément lui-même)',
    comparisonValue: 'Valeur de comparaison',
    storeMatchesIn: 'Stocker les correspondances dans',
    sourceText: 'Texte source',
    caseGroup: 'Casse',
    spacesGroup: 'Espaces',
    manipulationGroup: 'Manipulation',
    infoGroup: 'Informations',
    uppercase: 'MAJUSCULES',
    lowercase: 'minuscules',
    trimBoth: 'Trim (les deux)',
    trimStart: 'Trim début',
    trimEnd: 'Trim fin',
    replaceAll: 'Remplacer tout',
    replaceFirst: 'Remplacer premier',
    splitOp: 'Découper (split)',
    sliceOp: 'Extraire (slice)',
    reverse: 'Inverser',
    repeat: 'Répéter',
    padStart: 'Remplir début',
    padEnd: 'Remplir fin',
    length: 'Longueur',
    containsQ: 'Contient ?',
    startsWithQ: 'Commence par ?',
    endsWithQ: 'Finit par ?',
    indexOf: 'Position de',
    search: 'Chercher',
    searchValue: 'Valeur à chercher',
    replaceWith: 'Remplacer par',
    separator: 'Séparateur',
    startIndex: 'Début (index)',
    endExcluded: 'Fin (exclue, vide = fin)',
    targetLength: 'Longueur cible',
    repeatCount: 'Nombre de répétitions',
    fillCharacter: 'Caractère de remplissage',
    storeInVariable: 'Stocker dans la variable',
    sourceArray: 'Tableau source',
    arrayVariable: 'Variable tableau',
    arrayVariableHint: 'Variable contenant un tableau JSON.',
    addRemoveGroup: 'Ajouter / Retirer',
    searchGroup: 'Recherche',
    infoArrayGroup: 'Informations',
    sortGroup: 'Trier',
    push: 'Push (ajouter en fin)',
    pop: 'Pop (retirer le dernier)',
    unshift: 'Unshift (ajouter en début)',
    shift: 'Shift (retirer le premier)',
    clearArray: 'Vider le tableau',
    containsValue: 'Contient la valeur ?',
    indexOfValue: 'Index de la valeur',
    join: 'Joindre (join)',
    sliceArray: 'Extraire (slice)',
    sort: 'Trier (sort)',
    reverseArray: 'Inverser (reverse)',
    jsonToParse: 'JSON à parser',
    jsonSource: 'Source JSON',
    flattenKeys: 'Aplatir les clés',
    parseErrorHint: 'En cas d\'erreur de parsing, la sortie Erreur est suivie.',
    jsonSourceVar: 'Variable source',
    serializeHint: 'Le contenu de cette variable sera sérialisé en JSON.',
    indentation: 'Indentation (0 = compact)',
    typeConversion: 'Conversion de type',
    sourceValue: 'Valeur source',
    targetType: 'Type cible',
    behaviors: 'Comportements',
    dateTimeCurrent: 'Date & Heure actuelle',
    variablePrefix: 'Préfixe de variable',
    variablesCreated: 'Variables créées :',
    dateShort: 'date courte + heure',
    timestamp: 'timestamp (ms)',
    iso8601: 'ISO 8601',
    components: 'composants',
    time: 'heure',
    timezone: 'Fuseau horaire',
    customFormat: 'Format personnalisé',
    destination: 'Destination',
    text: 'Texte',
    content: 'Contenu',
    ephemeral: 'Éphémère',
    ephemeralHint: 'Visible uniquement par l\'utilisateur',
    richEmbed: 'Embed riche',
    enabled: 'Activé',
    title: 'Titre',
    embedTitlePlaceholder: 'Titre de l\'embed',
    description: 'Description',
    bodyTextPlaceholder: 'Corps du texte…',
    color: 'Couleur',
    author: 'Auteur',
    authorNamePlaceholder: 'Nom de l\'auteur',
    authorIcon: 'Icône auteur',
    footer: 'Pied de page',
    footerTextPlaceholder: 'Texte de pied de page',
    imageUrl: 'Image URL',
    thumbnailUrl: 'Miniature URL',
    fields: 'Champs',
    fieldNamePlaceholder: 'Nom du champ',
    fieldValuePlaceholder: 'Valeur du champ',
    addField: 'Ajouter un champ',
    imageUrlLabel: 'URL de l\'image',
    caption: 'Légende',
    captionOptional: 'Légende optionnelle',
    spoiler: 'Spoiler',
    spoilerHideImage: 'Cache l\'image derrière un tag spoiler.',
    attachment: 'Fichier joint',
    fileUrl: 'URL du fichier',
    fileName: 'Nom du fichier',
    altDescription: 'Texte alternatif / description',
    spoilerHideFile: 'Cache le fichier derrière un tag spoiler.',
    botJoinsMuted: 'Le bot rejoint le canal en mode muet.',
    botJoinsDeaf: 'Le bot rejoint le canal en mode sourd (recommandé si non vocal).',
    disconnectBot: 'Déconnecte le bot du canal vocal qu\'il occupe actuellement sur le serveur.',
    audioSource: 'Source audio',
    urlDirect: 'URL directe (MP3, OGG…)',
    youtube: 'YouTube (URL ou ID)',
    variableBuffer: 'Variable (buffer)',
    volume: 'Volume (0–200 %)',
    waitEnd: 'Attendre la fin',
    waitEndHint: 'Le workflow attend que la piste soit terminée avant de continuer.',
    stopPlayback: 'Stoppe immédiatement la lecture audio en cours dans le canal vocal du bot.',
    member: 'Membre',
    destChannel: 'Canal de destination',
    status: 'Statut',
    statusOnline: '🟢 En ligne',
    statusIdle: '🌙 Inactif',
    statusDnd: '⛔ Ne pas déranger',
    statusInvisible: '⬛ Invisible',
    activity: 'Activité',
    activityText: 'Texte de l\'activité',
    streamUrl: 'URL du stream (Twitch/YouTube)',
    rotationOptional: 'Rotation (optionnel)',
    rotationHint: 'Ajoutez une liste d\'activités séparées par des sauts de ligne. Le bot tournera entre elles.',
    rotationActivities: 'Activités en rotation',
    rotationPlaceholder: 'joue à des workflows\nregarde le serveur\nécoute les événements',
    rotationInterval: 'Intervalle de rotation (secondes)',
    serverNickname: 'Surnom dans ce serveur',
    newNickname: 'Nouveau surnom',
    emptyToReset: 'Laissez vide pour réinitialiser',
    globalAvatar: 'Avatar global du bot',
    avatarUrl: 'URL ou base64 de l\'image',
    avatarLimitHint: 'L\'avatar Discord ne peut être changé que 2 fois par heure.',
    recipient: 'Destinataire',
    targetMessage: 'Message cible',
    emoji: 'Émoji',
    emojiHint: 'Emoji Unicode (ex. 👍) ou emoji serveur custom',
    thread: 'Fil de discussion',
    source: 'Source',
    fromChannel: 'Depuis un canal (forum/text)',
    fromMessage: 'Depuis un message',
    autoArchive: 'Auto-archive (minutes)',
    oneHour: '1 heure',
    twentyFourHours: '24 heures',
    threeDays: '3 jours',
    oneWeek: '1 semaine',
    privateThread: 'Fil privé',
    privateThreadHint: 'Seuls les membres invités peuvent voir ce fil.',
    threadToArchive: 'ID du fil à archiver',
    lock: 'Verrouiller',
    lockHint: 'Verrouille le fil (seuls les modérateurs peuvent réouvrir).',
    channelToEdit: 'Canal à modifier',
    modifications: 'Modifications',
    newName: 'Nouveau nom',
    leaveEmptyNoChange: 'Laissez vide pour ne pas changer',
    newTopic: 'Nouveau topic',
    slowmode: 'Slowmode (secondes, 0 = désactivé)',
    sourceChannel: 'Canal source',
    durationSeconds: 'Durée (secondes, 0 = illimitée)',
    maxUses: 'Utilisations max (0 = illimité)',
    unique: 'Unique',
    uniqueHint: 'Génère toujours un nouveau lien unique.',
    storeLinkIn: 'Stocker le lien dans la variable',
    muteLabel: 'Couper le micro',
    deafenLabel: 'Assourdir',
    disableMuteHint: 'Désactivez pour retirer le mute.',
    disableDeafenHint: 'Désactivez pour retirer le deafen.',
    userToFetch: 'Utilisateur à récupérer',
    includeMemberData: 'Inclure les données membre',
    includeMemberDataHint: 'Récupère aussi le surnom, les rôles et la date d\'arrivée dans le serveur.',
    messageContent: 'Contenu du message',
    chooseOption: 'Choisissez une option :',
    reply: 'Reply',
    replyToInteraction: 'Répondre à l\'interaction actuelle',
    buttons: 'Boutons',
    buttonN: 'Bouton',
    label: 'Label *',
    clickHere: 'Cliquez ici',
    addButton: 'Ajouter un bouton',
    makeYourChoice: 'Faites votre choix :',
    placeholder: 'Placeholder',
    chooseAnOption: 'Choisissez une option...',
    minChoices: 'Min choix',
    maxChoices: 'Max choix',
    options: 'Options',
    optionN: 'Option',
    default_: 'Défaut',
    shortDescPlaceholder: 'Description courte',
    addOption: 'Ajouter une option',
    users: 'utilisateurs',
    roles: 'rôles',
    channels: 'canaux',
    selectItems: 'Sélectionnez des',
    chooseItems: 'Choisir des',
    resultVariable: 'Variable de résultat',
    modal: 'Modal',
    titleRequired: 'Titre *',
    formPlaceholder: 'Formulaire de contact',
    modalWarning: '⚠️ Les modals ne peuvent être affichés qu\'en réponse à une interaction (bouton, commande, menu).',
    modalFields: 'Champs',
    fieldN: 'Champ',
    labelRequired: 'Label *',
    yourMessage: 'Votre message',
    shortOneLine: 'Courte (1 ligne)',
    paragraph: 'Paragraphe',
    enterPlaceholder: 'Saisissez...',
    required: 'Requis',
    addFieldBtn: 'Ajouter un champ',
    interactionHandler: '📡 Interaction Handler',
    interactionDesc: 'Déclenche votre workflow à chaque fois qu\'un {type} correspondant est activé.',
    button: 'bouton',
    selectMenu: 'menu sélecteur',
    linkToNode: 'Lier à un nœud du workflow',
    reactiveButton: 'Bouton réactif',
    customIdApplied: '✅ Custom ID … automatiquement appliqué.',
    activeCustomId: 'Custom ID actif',
    manualCustomId: '✏️ Saisir un Custom ID manuellement',
    customIdFilter: 'Filtre Custom ID',
    matchType: 'Type de correspondance',
    startsWithPrefix: 'Commence par (préfixe)',
    exactlyEquals: 'Exactement égal',
    containsMatch: 'Contient',
    regex: 'Regex',
    backToBuilder: '← Revenir au builder visuel',
    interactionVariable: 'Variable d\'interaction',
    customIdUniqueHint: '(unique, utilisé pour écouter les clics)',
    customIdSubmissionHint: '(pour écouter la soumission)',
    request: 'Requête',
    method: 'Méthode',
    headersJson: 'Headers (JSON)',
    responseVariable: 'Variable de réponse',
    storesResponseBody: 'Stocke le corps de la réponse.',
    webhookSourceNode: 'ℹ️ Nœud source Webhook',
    webhookDesc: 'Ce nœud démarre le workflow lorsqu\'un appel HTTP entrant est reçu sur l\'URL de webhook générée par votre instance.',
    receiveVariable: 'Variable de réception',
    receiveHint: 'Le corps du POST entrant sera stocké dans cette variable.',
    target: 'Cible',
    userId: 'ID Utilisateur',
    reason: 'Raison',
    timeoutEndedEarly: 'Timeout terminé anticipativement',
    messageCount: 'Nombre de messages (1–100)',
    discordIgnoresOld: 'Discord ignore les messages de plus de 14 jours.',
    deletedCountVar: 'Variable — nombre supprimé',
    serverSettings: 'Paramètres du serveur',
    auditReason: 'Raison d\'audit',
    autoUpdate: 'Mise à jour automatique',
    role: 'Rôle',
    roleId: 'ID du rôle',
    displaySeparately: 'Affiché séparément',
    mentionable: 'Mentionnable',
    autoModification: 'Modification automatique',
    roleToDelete: 'Rôle à supprimer',
    autoDeletion: 'Suppression automatique',
    createdIdVar: 'Variable — ID créé',
    emojiId: 'ID de l\'emoji',
    newNameLabel: 'Nouveau nom',
    stickerDescription: 'Description du sticker',
    emojiTag: 'Emoji tag (ex: 🙂)',
    fileUrlLabel: 'URL du fichier',
    stickerToDelete: 'Sticker à supprimer',
    stickerId: 'ID du sticker',
    details: 'Détails',
    eventDescription: 'Description optionnelle de l\'événement',
    locationType: 'Type de lieu',
    externalLocation: 'Externe (lieu texte)',
    voiceChannelType: 'Salon vocal',
    stageType: 'Stage',
    voiceChannelId: 'ID du salon vocal',
    locationText: 'Lieu (texte)',
    locationPlaceholder: 'Discord Voice / En ligne',
    startIso: 'Début (ISO 8601)',
    endIso: 'Fin (ISO 8601, optionnel)',
    coverImage: 'Image de couverture (URL)',
    eventToDelete: 'Événement à supprimer',
    eventId: 'ID de l\'événement',
    targetChannel: 'Salon cible',
    webhookName: 'Nom du webhook',
    avatarOptional: 'Avatar (URL, optionnel)',
    webhookUrlVar: 'Variable — URL du webhook',
    webhookIdVar: 'Variable — ID du webhook',
    webhookToDelete: 'Webhook à supprimer',
    webhookId: 'ID du webhook',
    webhookUrlRequired: 'URL du webhook *',
    useCreateWebhookVar: 'Utilisez la variable du noeud Create Webhook',
    messageContentPlaceholder: 'Contenu du message...',
    fileAttachment: 'Fichier / Pièce jointe',
    fileOrAttachmentUrl: 'URL ou chemin du fichier',
    publicUrlHint: 'URL publique ou variable de fichier généré (canvas card, etc.).',
    allActions: 'Toutes les actions',
    filterByUser: 'Filtrer par utilisateur (ID, optionnel)',
    actionType: 'Type d\'action (optionnel)',
    searchUsername: 'Recherche (username partiel, optionnel)',
    limit: 'Limite (max 1000)',
    square: 'Carré (512)',
    background: 'Arrière-plan',
    textLayer: 'Texte',
    imageAvatar: 'Image / Avatar',
    rectangleLayer: 'Rectangle',
    progressBar: 'Barre de progression',
    circleEllipse: 'Cercle / Ellipse',
    lineLayer: 'Ligne',
    badge: 'Badge (texte+fond)',
    style: '🎨 Style',
    position: '📐 Position',
    shadow: '💡 Ombre',
    opacity: 'Opacité',
    solid: '🎨 Uni',
    gradient: '🌈 Dégradé',
    imageType: '🖼️ Image',
    colorLabel: 'Couleur',
    from: 'Depuis',
    to: 'Vers',
    direction: 'Direction',
    sizePx: 'Taille (px)',
    weight: 'Graisse',
    textColor: 'Couleur texte',
    alignment: 'Alignement',
    badgeBg: 'Fond badge',
    cornerRadius: 'Rayon coins',
    paddingX: 'Padding X',
    paddingY: 'Padding Y',
    circularCrop: 'Découpe circulaire',
    bgColor2: 'Couleur fond',
    border: 'Bordure',
    borderThickness: 'Épaisseur bordure',
    radiusPx: 'Rayon (px)',
    thicknessPx: 'Épaisseur (px)',
    endings: 'Extrémités',
    rounded: 'Arrondi',
    straight: 'Droit',
    squareEnd: 'Carré',
    barColor: 'Couleur barre',
    valueExpression: 'Valeur (expression)',
    maxValueLabel: 'Valeur max',
    blurPx: 'Flou (px)',
    offsetX: 'Décalage X',
    offsetY: 'Décalage Y',
    dimensions: 'Dimensions',
    widthPx: 'Largeur (px)',
    heightPx: 'Hauteur (px)',
    centerX: 'Centre X',
    centerY: 'Centre Y',
    hide: 'Masquer',
    show: 'Afficher',
    layers: 'Calques',
    noLayers: 'Aucun calque — ajoutez-en un ci-dessous',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    duplicate: 'Dupliquer',
    deleteLayer: 'Supprimer',
    addLayer: '+ Ajouter un calque',
    bgLayerName: 'Fond',
    rectLayerName: 'Rectangle',
    circleLayerName: 'Cercle',
    lineLayerName: 'Ligne',
    textLayerName: 'Texte',
    badgeLayerName: 'Badge',
    imageLayerName: 'Image',
    barLayerName: 'Barre',
    inSendImageNode: 'dans un nœud',
    canvasCardSendHint: 'Envoie l\'image générée dans un canal sans passer par un nœud Send Image.',
    sendDirectToDiscord: 'Envoyer directement sur Discord',
    noBotAssociatedSql: 'Aucun bot associé',
    noBotAssociatedSqlDesc: 'Ce workflow n\'est relié à aucune instance de bot. Assignez un bot depuis le Dashboard pour utiliser les requêtes SQL.',
    dbNotFound: 'Base de données introuvable',
    dbNotFoundDesc: 'Le bot n\'a pas encore de base de données, ou elle est hors-ligne. Créez-en une depuis l\'onglet Database du Dashboard.',
    createDatabase: 'Créer une base de données',
    retryBtn: 'Réessayer',
    queryType: 'Type de requête',
    refreshTables: 'Rafraîchir les tables',
    noTables: 'Aucune table.',
    createFromDashboard: 'Créez-en une depuis le Dashboard',
    allColumns: 'Toutes les colonnes',
    columnsLabel: 'Colonnes',
    loadingColumns: 'Chargement des colonnes…',
    whereConditionsSql: 'Conditions WHERE',
    orderBy: 'Tri (ORDER BY)',
    dataToInsert: 'Données à insérer',
    addValue: 'Ajouter une valeur',
    binding: 'Liaison :',
    columnPlaceholder: '— Colonne —',
    addCondition: 'Ajouter une condition',
    noConditionWarning: 'Aucune condition — toutes les lignes seront concernées',
    addSort: 'Ajouter un tri',
    deleteAllWarning: 'Si WHERE est vide, toutes les lignes de la table seront supprimées.',
    sqlQueryTitle: 'Requête SQL',
    unlimited: 'Illimité',
    iconUrlBase64: 'Icône (URL ou base64)',
    bannerUrl: 'Bannière (URL)',
    verifiedMember: 'Membre vérifié',
    backToVisualBuilder: 'Revenir au builder visuel',
    codeExamplePlaceholder: '// Exemple\nconst score = ctx.variables.score ?? 0;\nreturn score + 1;',
    codeCtxPrefix: 'Le contexte',
    codeCtxContains: 'contient',
    codeCtxUseReturn: 'Utilisez',
    codeCtxForResult: 'pour le r\u00e9sultat.',
    accessViaNextNodes: 'Acc\u00e8s dans les n\u0153uds suivants via',
    regexHint: 'Entrer une expression r\u00e9guli\u00e8re, ex.',
    maxDelayWarning: '\u26a0\ufe0f Maximum 5 minutes (300 000 ms) \u2014 les valeurs sup\u00e9rieures sont tronqu\u00e9es.',
    switchDefaultPrefix: 'Si aucun cas ne correspond, la sortie',
    switchDefaultSuffix: 'est utilis\u00e9e.',
    contentOf: 'Contenu de',
    acceptsJsonArray: 'Accepte un tableau JSON',
    orCsvList: 'ou une liste s\u00e9par\u00e9e par des virgules.',
    currentItemValueIn: 'Valeur de l\u2019\u00e9l\u00e9ment courant dans',
    jsonArrayOrCsvIn: 'Tableau JSON ou liste CSV dans',
    jsonArrayVarHint: 'Variable contenant un tableau JSON.',
    variableName: 'Nom de la variable',
    jsonSerializeHint: 'Le contenu de cette variable sera s\u00e9rialis\u00e9 en JSON.',
    indentCompact: 'Indentation (0 = compact)',
    dateTokensPrefix: 'Tokens :',
    dateTokensStoredIn: '\u2192 stock\u00e9 dans',
    loopUsageTitle: '\u26a0\ufe0f Utilisation',
    loopConnectOutput: 'Connectez la sortie',
    loopToRepeat: 'vers le bloc \u00e0 r\u00e9p\u00e9ter, et rebouclez-la sur ce n\u0153ud. La sortie',
    loopDoneOutput: 'Termin\u00e9',
    loopDoneContinues: 'continue quand la condition est fausse ou que le max est atteint.',
    activityRotationDesc: 'Ajoutez une liste d\u2019activit\u00e9s s\u00e9par\u00e9es par des sauts de ligne. Le bot tournera entre elles.',
    avatarRateLimitHint: 'L\u2019avatar Discord ne peut \u00eatre chang\u00e9 que 2 fois par heure.',
    fetchUserCreates: 'Cr\u00e9e :',
    fetchUserEtc: ', etc.',
    selectOutputHint: 'contiendra un tableau des \u00e9l\u00e9ments s\u00e9lectionn\u00e9s.',
    fieldsCount: 'Champs',
    filterSectionTitle: 'Filtre',
    buttonCustomId: 'Custom ID du bouton',
    optionalLabel: 'optionnel',
    optionalRestrictUser: 'optionnel \u2014 restreindre \u00e0 1 utilisateur',
    optionalMessage: 'optionnel',
    timeoutHintPrefix: 'Si aucun clic dans ce d\u00e9lai, la sortie',
    timeoutHintSuffix: 'est activ\u00e9e.',
    storesHint: 'Stocke :',
    menuCustomId: 'Custom ID du menu',
    storesValuesArray: '(tableau) et',
    httpResponsePrefix: 'Stocke le corps de la r\u00e9ponse. Le statut HTTP est dans',
    httpResponseSuffix: '.',
    webhookSourceTitle: '\u2139\ufe0f N\u0153ud source Webhook',
    webhookTriggerDesc: 'Ce n\u0153ud d\u00e9marre le workflow lorsqu\u2019un appel HTTP entrant est re\u00e7u sur l\u2019URL de webhook g\u00e9n\u00e9r\u00e9e par votre instance.',
    postBodyHint: 'Le corps du POST entrant sera stock\u00e9 dans cette variable.',
    publicUrlOrVarHint: 'URL publique ou variable de fichier g\u00e9n\u00e9r\u00e9 (canvas card, etc.).',
    waitLabel: 'Wait',
    waitHint: 'Attend la confirmation Discord (n\u00e9cessaire pour obtenir l\u2019ID du message)',
    outputVarLabel: 'Variable de sortie',
    ifWaitActive: '(si Wait actif)',
    auditLogJsonHint: 'Tableau JSON d\u2019entr\u00e9es avec',
    fetchMembersJsonHint: 'Tableau JSON avec',
    goToDashboard: 'Aller au Dashboard',
    createFromDashboardLink: 'Cr\u00e9ez-en une depuis le Dashboard',
    columnsTitle: 'Colonnes',
    loadingColumnsText: 'Chargement des colonnes\u2026',
    loadingText: 'chargement\u2026',
    rawVarsInterpreted: 'Les variables',
    rawVarsInterpretedSuffix: 'sont interpr\u00e9t\u00e9es avant ex\u00e9cution.',
    rootNode: 'Nœud racine',
    executeToSeeOutput: 'Exécutez le workflow pour voir les données de sortie',
    connections: 'Connexions',
    notConnected: 'Non connecté',
    layerText: 'Texte',
    layerImageAvatar: 'Image / Avatar',
    layerRectangle: 'Rectangle',
    layerProgressBar: 'Barre de progression',
    layerCircleEllipse: 'Cercle / Ellipse',
    layerLine: 'Ligne',
    layerBadgeLabel: 'Badge (texte+fond)',
    addBgLabel: 'Fond',
    addCircleLabel: 'Cercle',
    addLineLabel: 'Ligne',
    addTextLabel: 'Texte',
    addBadgeLabel: 'Badge',
    addBarLabel: 'Barre',
    storeImageInVar: 'Stocker l\'image dans la variable',
    layersHeader: 'Calques',
    bottomToTop: 'bas → haut',
    noLayersHint: 'Aucun calque — ajoutez-en un ci-dessous',
    outputLabel: 'Sortie :',
    storesPrefix: 'Stocke',
    usesDynamicVars: 'Utilise des variables dynamiques comme',
    availableVia: 'Disponible via',
    objectAccessibleVia: 'L\'objet sera accessible via',
    flattenHint: 'Pour un objet {"a":1}, mappe aussi variable.data.a → 1.',
    parseErrorHintText: 'En cas d\'erreur de parsing, la sortie Erreur est suivie.',
    errorOutputLabel: 'Erreur',
    booleanHint: '"true", "1" ou nombre > 0 → true',
    integerHint: 'troncature (ex. 3.9 → 3)',
    numberHint: 'virgule flottante',
    dateShortTime: 'date courte + heure',
    timestampMs: 'timestamp (ms)',
    componentsLabel: 'composants',
    timeLabel: 'heure',
    botJoinsMutedHint: 'Le bot rejoint le canal en mode muet.',
    currentlyOnServer: 'qu\'il occupe actuellement sur le serveur.',
    inBotVoiceChannel: 'en cours dans le canal vocal du bot.',
    discordIgnoresOldMsg: 'Discord ignore les messages de plus de 14 jours.',
    useCreateWebhookVarHint: 'Utilisez la variable du noeud Create Webhook :',
    webhookRichEmbed: 'Embed riche',
    webhookEnabled: 'Activé',
    webhookTitle: 'Titre',
    webhookDescription: 'Description',
    webhookColor: 'Couleur',
    webhookImageUrl: 'Image URL',
    webhookMiniatureUrl: 'Miniature URL',
    storesColon: 'Stocke :',
    messageContentPh: 'Contenu du message...',
    nomLabel: 'Nom',
    descriptionLabel: 'Description',
    emojiUnicodeHint: 'Emoji Unicode (ex. 👍) ou emoji serveur custom (ex. <:name:123>)',
    liaisonLabel: 'Liaison :',
    endEmpty: 'Fin (vide = fin)',
    valuePlaceholder: 'valeur',
    valueOrVar: 'valeur ou {variable.x}',
    conditionTitle: 'Condition',
    casesTitle: 'Cas',
    targetChannelTitle: 'Canal cible',
    voiceChannelTitle: 'Canal vocal',
    destinationTitle: 'Destination',
    contentTitle: 'Contenu',
    channelTitle: 'Salon',
    statutTitle: 'Statut',
    variableLabel: 'Variable',
    phOrFixedValue: 'ou une valeur fixe',
    phOrThreshold: 'ou {variable.seuil}',
    phOrChoice: 'ou {variable.etat}',
    phOrValue: 'ou valeur',
    supportsVars: 'Supporte',
    commonVarsLabel: 'Variables communes :',
    saveLabel: 'Enregistrer',
    closeLabel: 'Fermer',
    phAvatarOrUrl: '{user.avatar} ou URL directe',
    phUrlOrVar: 'https://… ou {variable.bg}',
    phXpOr50: '{variable.xp} ou 50',
    noOutputDefined: 'Aucune sortie définie',
    roleInfoTitle: 'Infos du rôle',
    optionsTitle: 'Options',
    targetMemberTitle: 'Membre cible',
    auditLogTitle: 'Journal d\'audit',
    targetUserTitle: 'Utilisateur cible',
    durationTitleSection: 'Durée',
    nicknameTitle: 'Surnom',
    channelInfoTitle: 'Infos du salon',
    messageTitle: 'Message',
    randomTitle: 'Aléatoire',
    counterTitle: 'Compteur',
    switchCaseTitle: 'Switch / Case',
    timeoutTitle: 'Timeout',
    commandInfoTitle: 'Infos de la commande',
    parametersTitle: 'Paramètres',
    permissionsTitle: 'Permissions',
    discordEventTitle: 'Événement Discord',
    webhookTitleSection: 'Webhook',
    filtersTitle: 'Filtres',
    tableTitleSection: 'Table',
    conditionsWhereTitle: 'Conditions WHERE',
    orderByTitle: 'Tri (ORDER BY)',
    stickerTitle: 'Sticker',
    eventTitleSection: 'Événement',
    nodeInfoTitle: 'Infos du nœud',
    executionTitle: 'Exécution',
    notesTitle: 'Notes',
    newContentTitle: 'Nouveau contenu',
    replyContentTitle: 'Contenu de la réponse',
    modalTitleSection: 'Modal',
    messageIdLabel: 'ID du message',
    channelIdLabel: 'ID du salon',
    typeLabel: 'Type',
    deleteMessageDays: 'Supprimer l\'historique des messages (jours)',
    topicLabel: 'Sujet',
    parentCategoryId: 'ID de la catégorie parente',
    volumeLabel: 'Volume (0–200 %)',
    urlLabel: 'URL',
    messageLabel: 'Message',
    headersJsonLabel: 'Headers (JSON)',
    bodyLabel: 'Corps',
    eventLabel: 'Événement',
    selfMuteLabel: 'Auto-muet',
    selfDeafLabel: 'Auto-sourd',
    usernameLabel: 'Nom d\'utilisateur',
    avatarUrlLabelSmall: 'URL de l\'avatar',
    imageUrlEmbedLabel: 'Image URL',
    footerLabelSmall: 'Footer',
    requiredCheckbox: 'Requis',
    onErrorLabel: 'En cas d\'erreur',
    categoryLabel: 'Catégorie',
    idLabel: 'ID',
    roleIdLabel: 'ID du rôle',
    inlineLabel: 'Inline',
    hoistLabel: 'Hoist',
    mentionableHintToggle: 'Mentionable',
    mentionAuthorLabel: 'Mentionner l\'auteur',
    nsfwLabel: 'NSFW',
    alwaysOutputDataLabel: 'Toujours produire des données',
    executeOnceLabel: 'Exécuter une seule fois',
    retryOnFailLabel: 'Réessayer en cas d\'erreur',
    displayNoteInFlowLabel: 'Afficher la note dans le flux',
    ttsLabel: 'Synthèse vocale',
    hoistHint: 'Afficher le rôle séparément dans la liste des membres.',
    mentionableHintText: 'Permettre à quiconque de @mentionner ce rôle.',
    reasonForKick: 'Raison de l\'expulsion',
    reasonForBan: 'Raison du bannissement',
    reasonForUnban: 'Raison du débannissement',
    reasonForTimeout: 'Raison du timeout',
    reasonForNicknameChange: 'Raison du changement de surnom',
    reasonForDeletion: 'Raison de la suppression',
    daysRangeHint: '0–7 jours.',
    blankToRemoveNickname: 'Laissez vide pour supprimer le surnom du membre.',
    nsfwHint: 'Marquer le salon comme réservé aux adultes.',
    irreversibleDeleteChannelWarning: 'Cette action est irréversible. Le salon et tous ses messages seront définitivement supprimés.',
    irreversibleDeleteMsgWarning: 'Le message sera définitivement supprimé et ne pourra pas être récupéré.',
    mentionAuthorHint: 'Mentionner l\'auteur du message original dans la réponse.',
    ttsHint: 'Lire la réponse à voix haute.',
    coreBotDesc: 'Le **Core Bot** est le point d\'entrée de votre workflow. Connectez des **Command Handlers** et des **Event Handlers** à ce nœud pour les enregistrer.',
    noSettingsHint: 'Aucun paramètre à configurer ici. Gérez votre token et le déploiement depuis le Dashboard.',
    noConfigAvailable: 'Aucune configuration disponible pour ce type de nœud.',
    alwaysOutputHint: 'Retourne un tableau vide même si aucune donnée n\'est produite.',
    executeOnceHint: 'Ne traite que le premier élément d\'entrée et ignore le reste.',
    retryOnFailHint: 'Réessaye automatiquement le nœud s\'il génère une erreur.',
    notesPlaceholder: 'Décrivez ce que fait ce nœud… (Markdown supporté)',
    displayNoteHint: 'Affiche cette note sous forme de carte sur le canvas du workflow.',
    executeOnceEventHint: 'Le handler se déclenche une fois, puis se supprime.',
    firesWhenPrefix: 'Se déclenche quand Discord émet l\'événement',
    firesWhenSuffix: '.',
    slashCommandPrefix: 'Commande slash :',
    newMessageText: 'Nouveau texte du message...',
    yourReply: 'Votre réponse...',
    optionalAuditLogReason: 'Raison optionnelle du journal d\'audit',
    newRolePlaceholder: 'nouveau rôle',
    channelTopicPlaceholder: 'Sujet du salon',
    categoryChannelIdPlaceholder: 'ID du salon catégorie (optionnel)',
    leaveEmptyToResetPlaceholder: 'Laissez vide pour réinitialiser',
    reasonForNicknameChangePlaceholder: 'Raison du changement de surnom',
    serverDescPlaceholder: 'Description du serveur',
    discordPermissionTab: 'Permission Discord',
    customRoleTab: 'Rôle personnalisé',
    addParameter: 'Ajouter un paramètre',
    addRole: 'Ajouter un rôle',
    roleNamePlaceholder: 'Nom du rôle',
    descriptionPlaceholder: 'Description',
    playingActivity: '🎮 Joue à',
    streamingActivity: '📡 Streame',
    listeningActivity: '🎧 Écoute',
    watchingActivity: '👀 Regarde',
    competingActivity: '🏆 Participe à',
    customStatusActivity: '✏️ Statut personnalisé',
    primaryStyle: 'Primary',
    secondaryStyle: 'Secondary',
    successStyle: 'Success',
    dangerStyle: 'Danger',
    linkStyle: 'Link',
    stopWorkflow: 'Arrêter le workflow',
    continueOption: 'Continuer',
    continueErrorOutput: 'Continuer (sortie erreur)',
    parametersTab: 'Paramètres',
    settingsTab: 'Réglages',
    docsBtn: 'Docs',
    outputJson: 'Output JSON',
    inputLabel: '⬅| Entrée',
    botInstance: 'Instance du bot',
    imageUrlSection: 'Image URL',
    contentLabel: 'Contenu',
    reasonLabel: 'Raison',
    userIdLabel: 'ID Utilisateur',
    nameLabel: 'Nom',
    colorLabel2: 'Couleur',
    threadIdLabel: 'ID du Thread',
    customIdLabel: 'Custom ID *',
    emojiLabel: 'Emoji',
    statusLabel: 'Statut',
    minLabel: 'Min',
    maxLabel: 'Max',
    placeholderLabel: 'Placeholder',
    valueLabel: 'Valeur *',
    feedbackHint: 'J\'aimerais que ce nœud puisse…',
    outputLabelRight: 'Output |→',
    ascLabel: 'ASC ↑',
    descLabel: 'DESC ↓',
    footerLabel: 'Pied de page',
    channelIdRequired: 'Channel ID',
    botInstanceFallback: 'Instance de bot',
    nameRequired: 'Nom',
    descriptionRequired: 'Description',
    addParameterBtn: 'Ajouter un paramètre',
    addRoleBtn: 'Ajouter un rôle',
    executeOnceEventLabel: 'Exécuter une seule fois',
    noTablesHint: 'Aucune table',
    optionsSectionTitle: 'Options',
    rectangleLabel: 'Rectangle',
    imageLabel: 'Image',
    profileCard: 'Carte de profil',
    welcomeBanner: 'Bannière de bienvenue',
    rankCard: 'Carte de rang',
    squareLabel: 'Carré (512)',
    textChannel: 'Salon textuel',
    categoryChannel: 'Catégorie',
    forumChannel: 'Salon forum',
    announcementChannel: 'Salon d\'annonces',
    days: 'Jours',
    stringType: 'Chaîne',
    integerType: 'Entier',
    numberType: 'Nombre',
    booleanType: 'Booléen',
    userType: 'Utilisateur',
    roleType: 'Rôle',
    channelType: 'Salon',
    mentionableType: 'Mentionnable',
    attachmentType: 'Pièce jointe',
    ctxUserId: 'ID utilisateur',
    ctxUsername: 'Nom d\'utilisateur',
    ctxUserTag: 'Tag utilisateur',
    ctxGuildId: 'ID du serveur',
    ctxGuildName: 'Nom du serveur',
    ctxChannelId: 'ID du salon',
    ctxChannelName: 'Nom du salon',
    ctxBotId: 'ID du bot',
    ctxBotUsername: 'Nom d\'utilisateur du bot',
    groupCore: 'Cœur',
    groupMessages: 'Messages',
    groupGuild: 'Serveur',
    groupMembers: 'Membres',
    groupChannels: 'Salons',
    groupRoles: 'Rôles',
    groupVoice: 'Vocal',
    groupInvites: 'Invitations',
    moreItems: 'de plus',
    moreKeys: 'clés de plus',
    tabStyle: '🎨 Style',
    tabPosition: '📍 Position',
    tabShadow: '🌑 Ombre',
    dirHorizontal: '↔ Horizontal',
    dirVertical: '↕ Vertical',
    dirDiagonal: '↗ Diagonal',
    weightNormal: 'Normal',
    weightBold: 'Gras',
    weightBlack: 'Noir (900)',
    sendImageNode: 'Send Image',
    customIdLabel2: 'Custom ID',
    viaPrefix: 'Via',
    etcSuffix: ', etc.',
    durationMs: '(ms)',
    descriptionEllipsis: 'Description...',
    placeholderPing: 'ex. ping',
    placeholderPingDesc: 'ex. Répond pong',
    statusRunning: 'En ligne',
    statusStopped: 'Arrêté',
    outputJsonSection: 'Output JSON',
    frArrayAndHint: '(tableau) et',
  },

  aiChat: {
    addNode: '+nœud',
    editNode: '~nœud',
    deleteNode: '×nœud',
    addEdge: '+lien',
    deleteEdge: '×lien',
    addNodeDesc: 'Ajouter **{nodeType}**{tempId}',
    editNodeDesc: 'Modifier {label} → {keys}',
    deleteNodeDesc: 'Supprimer {label}',
    addEdgeDesc: 'Connecter {source} → {target} ({handle})',
    deleteEdgeDesc: 'Supprimer connexion {edgeId}',
    newLabel: '+nouveau · ',
    suggestionAnalyze: 'Analyse mon workflow',
    suggestionAddCommand: 'Ajoute une commande /bonjour',
    suggestionWelcome: 'Welcome message when someone joins',
    suggestionDebug: 'Débogue les erreurs de ce workflow',
    suggestionExplain: 'Explique chaque nœud',
    toolbarTitle: 'IA Workflow',
    contextNodeOnly: 'Contexte : nœud sélectionné uniquement',
    contextFullWorkflow: 'Contexte : workflow entier',
    selectionLabel: 'Sélection',
    undoLabel: 'Annuler',
    undoTooltip: 'Annuler la dernière modification IA',
    clearConfirm: 'Clear AI chat history?',
    clearTooltip: 'Clear history',
    untitledWorkflow: 'Workflow sans nom',
    invalidResponse: 'Invalid AI response.',
    communicationError: 'Error communicating with AI.',
    emptyTitle: 'Assistant IA — Workflow',
    emptyDescription: 'Analyze, create, edit and debug your workflow.\nAI knows all your nodes and can edit them directly.',
    canvasPreview: 'Aperçu canvas',
    detailsOf: 'Détails des',
    modification: 'modification',
    modifications: 'modifications',
    applied: 'Appliqué',
    apply: 'Appliquer',
    analyzing: 'Analyse en cours…',
    contextNodeHint: 'Contexte : nœud',
    contextWorkflowHint: 'Contexte : workflow entier',
    placeholderNode: 'Question sur "{label}"…',
    placeholderDefault: 'Posez une question ou demandez une modification…',
    shortcutSend: '↵ Envoyer',
    shortcutNewline: 'Shift+↵ Nouvelle ligne',
    nodesInWorkflow: 'nœud(s) dans le workflow',
  },

  partner: {
    title: 'Programme Partenaire',
    subtitle: 'Parrainez des utilisateurs et gagnez des commissions sur leurs abonnements.',
    balance: 'Solde',
    totalEarned: 'Total gagné',
    referralsCount: 'Filleuls',
    referralLink: 'Lien de parrainage',
    referralDesc: 'Partagez ce lien. Les utilisateurs inscrits via votre lien bénéficient de 10% de réduction et vous recevez 10% de commission.',
    stripeConnect: 'Compte Stripe',
    stripeConnectDesc: 'Connectez votre compte Stripe pour recevoir vos paiements de commission.',
    connected: 'Connecté',
    payoutsEnabled: 'Virements activés',
    connectStripe: 'Connecter Stripe',
    withdraw: 'Retrait',
    withdrawDesc: 'Retirez votre solde vers votre compte Stripe (minimum 10€).',
    availableBalance: 'Solde disponible',
    withdrawBtn: 'Retirer',
    withdrawSuccess: 'Retrait de {amount}€ effectué avec succès.',
    withdrawError: 'Erreur lors du retrait.',
    connectFirst: 'Connectez d\'abord votre compte Stripe.',
    minWithdraw: 'Minimum 10€ requis pour un retrait.',
    referrals: 'Filleuls',
    noReferrals: 'Aucun filleul pour le moment.',
    email: 'Email',
    date: 'Date',
    earnings: 'Commissions',
    noEarnings: 'Aucune commission pour le moment.',
    amount: 'Montant',
    description: 'Description',
    withdrawals: 'Historique des retraits',
    statusCompleted: 'Complété',
    statusPending: 'En attente',
    statusFailed: 'Échoué',
    loadError: 'Erreur de chargement des données partenaire.',
    connectError: 'Erreur de connexion Stripe.',
  },

  onboarding: {
    // Libellés des catégories
    cat_welcome: 'Bienvenue',
    cat_dashboard: 'Tableau de bord',
    cat_workflow: 'Workflow',

    // Navigation
    next: 'Suivant',
    prev: 'Retour',
    skip: 'Passer le tour',
    finish: 'C\'est parti !',
    waitingForAction: 'Effectuez l\'action pour continuer…',

    // Étapes — Bienvenue
    welcomeTitle: 'Bienvenue sur DisFlow !',
    welcomeDesc: 'Découvrons ensemble votre espace de travail. Ce tour interactif vous guidera dans la création de votre premier bot Discord — sans écrire une seule ligne de code.',

    // Étapes — Tableau de bord
    statsTitle: 'Vos Statistiques',
    statsDesc: 'Ces cartes vous montrent un aperçu en temps réel de vos bots : nombre total, actifs, arrêtés et vos workflows.',
    widgetsTitle: 'Widgets de Monitoring',
    widgetsDesc: 'Suivez les performances de vos bots avec les graphiques d\'exécution, le fil d\'activité, les taux d\'erreur et l\'utilisation des ressources.',
    botlistTitle: 'Vos Instances',
    botlistDesc: 'Ici vous trouverez tous vos bots Discord. Vous pouvez les démarrer, arrêter, modifier ou supprimer. Chaque bot est lié à un workflow.',
    createBotTitle: 'Créez Votre Premier Bot',
    createBotDesc: 'Cliquez sur le bouton « Nouvelle Instance » pour créer votre premier bot. Vous aurez besoin de votre token Discord (depuis le Portail Développeur Discord).',

    // Étapes — Workflow
    workflowWelcomeTitle: 'Éditeur de Workflow',
    workflowWelcomeDesc: 'C\'est ici que la magie opère ! Concevez le comportement de votre bot visuellement en connectant des nœuds ensemble — comme des blocs de construction.',
    headerTitle: 'La Barre d\'Outils',
    headerDesc: 'Ici vous pouvez renommer votre workflow, voir le statut du bot associé, importer/exporter votre projet et accéder aux raccourcis clavier.',
    leftSidebarTitle: 'Barre Latérale Gauche',
    leftSidebarDesc: 'Accédez à vos bases de données, membres d\'équipe, paramètres du canevas, modèles prêts à l\'emploi et à la section d\'aide — tout depuis ce panneau.',
    canvasTitle: 'Le Canevas',
    canvasDesc: 'C\'est votre espace de travail visuel. Déplacez les nœuds pour les repositionner, double-cliquez pour les configurer, et zoomez avec la molette de votre souris.',
    sidebarTitle: 'Bibliothèque de Nœuds',
    sidebarDesc: 'Cette barre latérale contient tous les blocs de construction pour votre bot : déclencheurs, actions, logique, et plus. Parcourez les catégories ou recherchez un nœud spécifique.',
    addTriggerTitle: 'Ajoutez un Déclencheur',
    addTriggerDesc: 'Glissez un « Gestionnaire de Commande » ou « Gestionnaire d\'Événement » depuis la barre latérale vers le canevas. Les déclencheurs définissent quand votre bot répond.',
    addActionTitle: 'Ajoutez une Action',
    addActionDesc: 'Maintenant, glissez un nœud d\'action comme « Envoyer un Message » sur le canevas. Les actions définissent ce que votre bot fait lorsqu\'il est déclenché.',
    connectTitle: 'Connectez les Nœuds',
    connectDesc: 'Glissez depuis la poignée de sortie d\'un nœud (côté droit) vers la poignée d\'entrée d\'un autre nœud (côté gauche) pour créer une connexion. Cela définit le flux.',
    bottomBarTitle: 'Panneau Inférieur',
    bottomBarDesc: 'Activez le Chat IA pour obtenir de l\'aide dans la construction de votre workflow, ou ouvrez la Console pour voir les logs d\'exécution en temps réel quand votre bot tourne.',
    saveTitle: 'Sauvegardez Votre Travail',
    saveDesc: 'Cliquez sur le bouton Sauvegarder pour enregistrer votre workflow. Une fois sauvegardé, vous pouvez le déployer pour activer votre bot !',
    deployTitle: 'Déployez Votre Bot',
    deployDesc: 'Cliquez sur Déployer pour envoyer votre workflow vers votre bot. Il sera reconstruit et redémarré automatiquement avec vos dernières modifications.',
    completeTitle: 'Vous Êtes Prêt ! 🎉',
    completeDesc: 'Vous connaissez maintenant les bases de DisFlow. Créez des déclencheurs, ajoutez des actions, connectez-les et déployez votre bot. Bonne construction !',

    // Paramètres
    restartTour: 'Relancer le tour',
  },

  // ── Documentation ───────────────────────────────────────────────────────────
  docs: {
    docsLabel: 'Docs',
    homeLabel: 'Documentation',
    homeTitle: 'Documentation DisFlow',
    homeSubtitle: 'Tout ce dont vous avez besoin pour créer des bots Discord puissants — sans coder.',
    searchPlaceholder: 'Rechercher dans la documentation...',
    articlesLabel: 'articles',

    // ── Premiers pas ──
    gettingStartedTitle: 'Premiers Pas',
    gettingStartedDesc: 'Nouveau sur DisFlow ? Apprenez les bases et créez votre premier bot en quelques minutes.',
    whatIsDisflowTitle: 'Qu\'est-ce que DisFlow ?',
    whatIsDisflowBody: `DisFlow est une **plateforme visuelle no-code** qui vous permet de créer des bots Discord en connectant des nœuds sur un canevas — aucune compétence en programmation requise.

## Comment ça marche

- **Glissez-déposez** des nœuds de déclenchement et d\'action sur le canevas
- **Connectez-les** ensemble pour définir le comportement de votre bot
- **Configurez** chaque nœud via un panneau latéral simple
- **Déployez** en un clic et votre bot est en ligne instantanément

:::tip
DisFlow gère toutes les interactions complexes avec l\'API Discord en coulisses. Concentrez-vous simplement sur *ce que* votre bot doit faire, pas *comment* il le fait.
:::

## Pour qui ?

- Les gestionnaires de communauté qui veulent des bots personnalisés sans embaucher un développeur
- Les propriétaires de serveurs cherchant des outils de modération, des messages de bienvenue ou des mini-jeux
- Les développeurs qui veulent prototyper rapidement des idées de bots
- Toute personne qui préfère une approche visuelle de la création de bots`,

    createAccountTitle: 'Créer un Compte',
    createAccountBody: `## Options d\'inscription

Vous pouvez vous inscrire via :

- **E-mail et mot de passe** — remplissez le formulaire sur la page d\'inscription
- **Discord OAuth** — cliquez sur « Se connecter avec Discord » pour vous connecter instantanément

:::info
L\'utilisation de Discord OAuth lie votre identité Discord à DisFlow, facilitant la gestion des tokens et des permissions par la suite.
:::

## Configurer votre profil

Après l\'inscription, rendez-vous dans **Tableau de bord → Paramètres** pour :

- Choisir votre langue préférée (32+ langues disponibles)
- Sélectionner votre thème (clair ou sombre)
- Configurer les préférences de notification`,

    firstBotTitle: 'Créer Votre Premier Bot',
    firstBotBody: `## Étape par étape

1. Allez sur le **Tableau de bord**
2. Cliquez sur le bouton **« + Nouveau Bot »**
3. Entrez le **nom** et le **token Discord** de votre bot
4. Cliquez sur **Créer** — votre instance de bot est prête !

## Étapes suivantes

Une fois votre bot créé, cliquez dessus pour ouvrir l\'**Éditeur de Workflow**. De là :

- Ajoutez un **Gestionnaire de Commande** (ex. /ping)
- Connectez-le à une action **Envoyer un Message**
- Cliquez sur **Sauvegarder** puis **Déployer**

:::tip
Commencez simple ! Une commande /ping est le workflow parfait pour tester que tout fonctionne correctement.
:::

## Statut du bot

Votre bot affichera l\'un de ces statuts sur le tableau de bord :

- **En ligne** — le bot fonctionne et est connecté à Discord
- **Hors ligne** — le bot est arrêté
- **Erreur** — quelque chose s\'est mal passé, vérifiez les logs de la console`,

    discordTokenTitle: 'Obtenir un Token Discord',
    discordTokenBody: `## Créer une application Discord

1. Allez sur le **Portail Développeur Discord** (https://discord.com/developers/applications)
2. Cliquez sur **« Nouvelle Application »** et donnez-lui un nom
3. Naviguez vers l\'onglet **Bot** à gauche
4. Cliquez sur **« Ajouter un Bot »** et confirmez

## Copier le token

1. Sous l\'onglet Bot, cliquez sur **« Réinitialiser le Token »**
2. Copiez le token qui apparaît

:::warning
Ne partagez jamais votre token de bot publiquement ! Toute personne possédant le token peut contrôler votre bot. En cas de fuite, réinitialisez-le immédiatement depuis le Portail Développeur.
:::

## Inviter le bot sur votre serveur

1. Allez dans l\'onglet **OAuth2 → URL Generator**
2. Sélectionnez les scopes : **bot** et **applications.commands**
3. Sélectionnez les permissions nécessaires
4. Copiez l\'URL générée et ouvrez-la dans votre navigateur
5. Choisissez votre serveur et cliquez sur **Autoriser**

## Intents requis

Sous l\'onglet Bot, activez ces intents privilégiés si votre bot en a besoin :

- **Presence Intent** — pour suivre le statut en ligne/hors ligne
- **Server Members Intent** — pour réagir aux arrivées/départs de membres
- **Message Content Intent** — pour lire le contenu des messages`,

    // ── Tableau de bord ──
    dashboardTitle: 'Tableau de Bord',
    dashboardDesc: 'Naviguez entre vos bots, statistiques et paramètres depuis le tableau de bord principal.',
    dashOverviewTitle: 'Vue d\'ensemble',
    dashOverviewBody: `Le tableau de bord est votre **centre de commande** pour gérer tous vos bots DisFlow.

## Disposition

- **Barre de stats** en haut — total de bots, bots en ligne, workflows, déploiements
- **Cartes de bots** — chaque carte montre le nom, le statut et les actions rapides
- **Barre latérale** — naviguez entre Tableau de bord, Bases de données, Membres et Paramètres

## Actions rapides

Depuis chaque carte de bot, vous pouvez :

- **Ouvrir** l\'Éditeur de Workflow
- **Démarrer / Arrêter** le bot
- **Supprimer** l\'instance du bot
- Voir les **logs** et l\'activité récente`,

    dashStatsTitle: 'Statistiques & Widgets',
    dashStatsBody: `## Widgets du tableau de bord

Le tableau de bord affiche des widgets de vue d\'ensemble en temps réel :

- **Total Bots** — nombre d\'instances de bots créées
- **Bots en ligne** — combien sont actuellement en cours d\'exécution
- **Workflows** — nombre total de workflows sauvegardés
- **Déploiements** — nombre de déploiements aujourd\'hui

:::tip
Les widgets se mettent à jour en temps réel. Gardez le tableau de bord ouvert pour surveiller la santé de vos bots d\'un coup d\'œil.
:::`,

    dashInstancesTitle: 'Gérer les Instances',
    dashInstancesBody: `## Page d\'instance

Cliquez sur une carte de bot pour ouvrir sa page d\'instance dédiée où vous pouvez :

- Voir le **statut** détaillé et le **temps de fonctionnement**
- Voir et gérer les **workflows** attachés
- Accéder aux **logs** et à la **console**
- Mettre à jour le **token** ou les **paramètres**

## Démarrage et arrêt

- Cliquez sur **Démarrer** pour lancer le bot et le connecter à Discord
- Cliquez sur **Arrêter** pour l\'éteindre proprement
- Utilisez **Redémarrer** pour appliquer les changements après modification du token

:::info
Arrêter un bot ne supprime aucun workflow ni donnée. Vous pouvez le redémarrer à tout moment.
:::`,

    dashSettingsTitle: 'Paramètres du Compte',
    dashSettingsBody: `## Personnalisation

Dans **Tableau de bord → Paramètres**, vous pouvez configurer :

- **Langue** — choisissez parmi 32+ langues
- **Thème** — mode sombre ou clair
- **Couleur d\'accent** — personnalisez l\'interface
- **Notifications** — notifications par e-mail et navigateur

## Sécurité

- Changer votre **mot de passe**
- Activer l\'**authentification à deux facteurs** (si disponible)
- Voir les **sessions** actives
- **Supprimer le compte** — supprime toutes les données définitivement`,

    // ── Canevas ──
    canvasTitle: 'Canevas & Éditeur',
    canvasDesc: 'Maîtrisez l\'éditeur de workflow visuel — nœuds, connexions et raccourcis.',
    canvasBasicsTitle: 'Bases du Canevas',
    canvasBasicsBody: `Le canevas est l\'espace de travail principal où vous construisez la logique de votre bot visuellement.

## Navigation

- **Panoramique** — cliquez et glissez sur le canevas vide
- **Zoom** — molette de la souris ou pincement sur le trackpad
- **Ajuster la vue** — double-cliquez sur le canevas vide ou utilisez la minimap

## Éléments

- **Nœuds** — blocs colorés représentant des déclencheurs, actions ou logique
- **Arêtes** — lignes connectant les nœuds pour définir le flux d\'exécution
- **Poignées** — petits points sur les bords des nœuds où les connexions s\'attachent

:::tip
Utilisez la minimap (coin inférieur droit) pour naviguer rapidement dans les grands workflows.
:::`,

    addNodesTitle: 'Ajouter des Nœuds',
    addNodesBody: `## Méthodes

Il y a deux façons d\'ajouter des nœuds :

1. **Barre latérale gauche** → Parcourir les catégories → Cliquer ou glisser un nœud sur le canevas
2. **Clic droit** sur le canevas → Menu d\'ajout rapide

## Catégories de nœuds

- **Gestionnaires** (déclencheurs) — ce qui démarre le flux (commandes, événements, boutons…)
- **Actions** — ce que le bot fait (envoyer un message, gérer les rôles…)
- **Logique** — conditions, boucles, variables
- **Base de données** — requêtes SQL, gestion des tables

:::tip
Utilisez la barre de recherche dans la barre latérale pour trouver rapidement un type de nœud spécifique.
:::`,

    connectNodesTitle: 'Connecter les Nœuds',
    connectNodesBody: `## Comment connecter

1. Survolez la **poignée de sortie** d\'un nœud (côté droit) — elle se met en surbrillance
2. **Cliquez et glissez** depuis la poignée de sortie
3. Déposez sur la **poignée d\'entrée** d\'un autre nœud (côté gauche)

Une ligne colorée (arête) apparaît entre eux, représentant la direction du flux.

## Règles

- Un nœud déclencheur peut se connecter à plusieurs actions (exécution parallèle)
- Une action ne peut avoir qu\'**une seule connexion entrante**
- Vous ne pouvez pas créer de **boucles circulaires** (A → B → A)
- Les nœuds logiques (conditions) ont **plusieurs sorties** (chemins vrai/faux)

:::warning
Les nœuds déconnectés ne s\'exécuteront pas quand le bot tourne. Assurez-vous que chaque action est connectée à une chaîne de déclencheurs.
:::`,

    configureNodesTitle: 'Configurer les Nœuds',
    configureNodesBody: `## Ouvrir le panneau de configuration

Cliquez sur n\'importe quel nœud pour ouvrir sa **barre latérale de configuration** à droite. Chaque type de nœud a des paramètres spécifiques.

## Champs communs

- **Label** — un nom personnalisé pour identifier le nœud sur le canevas
- **Canal** — quel canal Discord cibler
- **Contenu** — le message texte à envoyer

## Variables

Utilisez des valeurs dynamiques avec la syntaxe **\`{variable}\`** :

- \`{user.name}\` — le nom de l\'utilisateur déclencheur
- \`{user.id}\` — son identifiant Discord
- \`{channel.name}\` — le canal où l\'événement s\'est produit
- \`{args}\` — les arguments de la commande

:::tip
Cliquez sur l\'icône de variable dans n\'importe quel champ texte pour parcourir les variables disponibles.
:::`,

    shortcutsTitle: 'Raccourcis Clavier',
    shortcutsBody: `## Raccourcis du canevas

- **Ctrl + S** — Sauvegarder le workflow
- **Ctrl + Z** — Annuler
- **Ctrl + Shift + Z** — Rétablir
- **Suppr / Retour arrière** — Supprimer le nœud ou l\'arête sélectionné(e)
- **Ctrl + A** — Tout sélectionner
- **Ctrl + C / V** — Copier / Coller des nœuds
- **Échap** — Tout désélectionner

## Navigation

- **Espace + Glisser** — Panoramique du canevas
- **Molette** — Zoom avant/arrière
- **Ctrl + Shift + F** — Ajuster tous les nœuds dans la vue

:::tip
Maintenez **Shift** en cliquant pour sélectionner plusieurs nœuds.
:::`,

    importExportTitle: 'Import & Export',
    importExportBody: `## Exporter un workflow

1. Ouvrez le workflow dans l\'éditeur
2. Cliquez sur le bouton **menu** (barre supérieure) → **Exporter**
3. Le workflow est enregistré en fichier JSON

## Importer un workflow

1. Dans l\'éditeur, cliquez sur **menu** → **Importer**
2. Sélectionnez un fichier JSON précédemment exporté
3. Les nœuds et arêtes sont chargés sur le canevas

:::info
Les workflows exportés peuvent être partagés avec d\'autres utilisateurs DisFlow. Ils n\'ont qu\'à importer le fichier JSON dans leur propre éditeur.
:::`,

    // ── Gestionnaires ──
    handlersTitle: 'Gestionnaires & Déclencheurs',
    handlersDesc: 'Configurez les événements et commandes qui démarrent vos workflows.',
    commandHandlerTitle: 'Gestionnaire de Commande',
    commandHandlerBody: `Le Gestionnaire de Commande déclenche votre workflow quand un utilisateur tape une **commande slash**.

## Configuration

- **Nom de la commande** — le nom après le slash (ex. \`/ping\`)
- **Description** — affichée dans le menu de commandes Discord
- **Options** — ajouter des paramètres (texte, nombre, utilisateur, canal, rôle, booléen)

## Exemple

Une simple commande **/ping** :

1. Ajoutez un nœud **Gestionnaire de Commande** → définissez le nom à \`ping\`
2. Connectez-le à un nœud **Envoyer un Message** → définissez le contenu à \`Pong ! 🏓\`
3. Déployez

:::tip
Discord met en cache les commandes slash. Après le premier déploiement, la commande peut mettre jusqu\'à une heure pour apparaître. Les mises à jour suivantes sont plus rapides.
:::

## Variables disponibles

- \`{user}\` — l\'utilisateur qui a lancé la commande
- \`{channel}\` — où la commande a été utilisée
- \`{guild}\` — le serveur
- \`{args.nomOption}\` — valeur des options de commande`,

    eventHandlerTitle: 'Gestionnaire d\'Événement',
    eventHandlerBody: `Le Gestionnaire d\'Événement se déclenche quand un **événement Discord** se produit — aucune commande utilisateur nécessaire.

## Événements disponibles

- **messageCreate** — un message est envoyé dans un canal
- **guildMemberAdd** — quelqu\'un rejoint le serveur
- **guildMemberRemove** — quelqu\'un quitte ou est retiré
- **messageReactionAdd** — une réaction est ajoutée
- **voiceStateUpdate** — quelqu\'un rejoint/quitte un canal vocal
- **interactionCreate** — un bouton, menu ou modal est soumis
- Et bien d\'autres…

## Configuration

1. Glissez un **Gestionnaire d\'Événement** sur le canevas
2. Sélectionnez le type d\'événement dans le menu déroulant
3. (Optionnel) Ajoutez des filtres — ex. ne déclencher que dans certains canaux

:::info
Certains événements nécessitent l\'activation des **intents privilégiés** dans le Portail Développeur Discord. Consultez le guide « Obtenir un Token Discord » pour les détails.
:::`,

    buttonHandlerTitle: 'Gestionnaire de Bouton',
    buttonHandlerBody: `Le Gestionnaire de Bouton se déclenche quand un utilisateur **clique sur un bouton** que votre bot a précédemment envoyé.

## Comment ça marche

1. D\'abord, envoyez un message avec des boutons via l\'action **Envoyer un Message** + **Ajouter un Bouton**
2. Assignez à chaque bouton un **Identifiant personnalisé** unique
3. Ajoutez un nœud **Gestionnaire de Bouton** et définissez le même identifiant

Quand un utilisateur clique sur ce bouton, le gestionnaire se déclenche et exécute les actions connectées.

## Configuration

- **Identifiant personnalisé** — doit correspondre exactement à l\'ID du bouton
- **Réponse éphémère** — option pour répondre uniquement au cliquer

:::tip
Utilisez des identifiants descriptifs comme \`verify-role\` ou \`ticket-open\` pour garder votre workflow lisible.
:::`,

    selectMenuHandlerTitle: 'Gestionnaire de Menu Déroulant',
    selectMenuHandlerBody: `Se déclenche quand un utilisateur **choisit une option** dans un menu déroulant.

## Configuration

1. Envoyez un message avec un menu déroulant via l\'action **Ajouter un Menu Déroulant**
2. Définissez des options avec des valeurs uniques
3. Ajoutez un **Gestionnaire de Menu Déroulant** avec l\'identifiant correspondant

## Variables disponibles

- \`{values}\` — la ou les valeur(s) sélectionnée(s)
- \`{user}\` — qui a fait la sélection

:::info
Les menus déroulants peuvent être configurés en **sélection unique** ou **sélection multiple**. En sélection multiple, \`{values}\` contiendra toutes les options choisies.
:::`,

    modalHandlerTitle: 'Gestionnaire de Modal',
    modalHandlerBody: `Se déclenche quand un utilisateur **soumet un modal** (formulaire popup).

## Créer un flux de modal

1. D\'abord, affichez le modal avec une action **Ouvrir un Modal** (généralement depuis un bouton ou une commande)
2. Définissez les champs du modal (entrées de texte)
3. Ajoutez un **Gestionnaire de Modal** avec l\'identifiant correspondant

## Configuration

- **Identifiant personnalisé** — doit correspondre à l\'ID du modal
- Les champs sont accessibles via \`{fields.fieldId}\`

## Exemple : Système de tickets

1. L\'utilisateur clique sur un bouton « Créer un Ticket »
2. Un modal s\'ouvre demandant le sujet et la description
3. Le Gestionnaire de Modal reçoit la soumission
4. Les actions connectées créent un canal et postent les informations du ticket

:::tip
Les modaux peuvent avoir jusqu\'à **5 entrées de texte** — utilisez le style court ou paragraphe.
:::`,

    // ── Actions ──
    actionsTitle: 'Actions Discord',
    actionsDesc: 'Envoyez des messages, gérez les rôles, modérez — tout ce que votre bot peut faire.',
    sendMessageTitle: 'Envoyer un Message',
    sendMessageBody: `L\'action la plus courante — envoie un message texte dans un canal Discord.

## Configuration

- **Canal** — sélectionnez un canal spécifique ou utilisez \`{channel}\` pour le canal courant
- **Contenu** — le texte à envoyer (supporte les variables et le markdown Discord)
- **Répondre** — basculez pour répondre au message déclencheur

## Markdown Discord

- **Gras** : \`**texte**\`
- *Italique* : \`*texte*\`
- __Souligné__ : \`__texte__\`
- ~~Barré~~ : \`~~texte~~\`
- Code : \`\\\`code\\\`\`
- Bloc de code : \`\\\`\\\`\\\`lang\\ncode\\\`\\\`\\\`\`

:::tip
Combinez l\'action Envoyer un Message avec un nœud **Embed** pour des messages enrichis avec couleurs, images et champs.
:::`,

    editDeleteTitle: 'Modifier & Supprimer des Messages',
    editDeleteBody: `## Modifier un message

Utilisez l\'action **Modifier un Message** pour changer un message précédemment envoyé :

- **ID du message** — l\'ID du message à modifier (utilisez \`{message.id}\` d\'un envoi précédent)
- **Nouveau contenu** — le texte mis à jour

## Supprimer un message

L\'action **Supprimer un Message** retire un message :

- **ID du message** — l\'ID à supprimer
- **Canal** — où se trouve le message

:::warning
Le bot ne peut modifier ou supprimer que les messages qu\'il a envoyés, ou les messages dans des canaux où il a la permission **Gérer les Messages**.
:::`,

    embedsTitle: 'Embeds',
    embedsBody: `Les embeds sont des **cartes de message enrichies** avec couleurs, titres, images et champs structurés.

## Champs d\'un embed

- **Titre** — texte d\'en-tête en gras
- **Description** — texte principal (supporte le markdown)
- **Couleur** — couleur de bordure (hex ou prédéfinie)
- **Miniature** — petite image (en haut à droite)
- **Image** — grande image en bas
- **Pied de page** — petit texte en bas
- **Auteur** — nom et icône en haut
- **Champs** — paires clé-valeur (en ligne ou empilées)

## Ajouter des champs

Cliquez sur **« + Ajouter un Champ »** pour ajouter des données structurées :

- **Nom** — titre du champ
- **Valeur** — contenu du champ
- **En ligne** — afficher côte à côte avec d\'autres champs en ligne

:::tip
Vous pouvez envoyer jusqu\'à **10 embeds** dans un seul message. Utilisez plusieurs nœuds embed connectés à un seul Envoyer un Message.
:::`,

    reactionsPinsTitle: 'Réactions & Épingles',
    reactionsPinsBody: `## Ajouter des réactions

L\'action **Ajouter une Réaction** ajoute un émoji en réaction à un message :

- **ID du message** — message cible
- **Émoji** — émoji Unicode ou ID d\'émoji personnalisé

## Épingler des messages

L\'action **Épingler un Message** épingle un message au canal :

- **ID du message** — le message à épingler

:::info
Discord limite les messages épinglés à **50 par canal**. Le bot a besoin de la permission **Gérer les Messages** pour épingler et ajouter des réactions.
:::`,

    threadsTitle: 'Threads',
    threadsBody: `## Créer des threads

L\'action **Créer un Thread** crée un nouveau fil de discussion :

- **Nom** — le titre du thread
- **Canal** — canal parent
- **Auto-archivage** — durée avant l\'archivage automatique (1h, 24h, 3j, 7j)
- **Message** — créer optionnellement à partir d\'un message existant

## Envoyer dans des threads

Utilisez l\'action **Envoyer un Message** avec l\'ID du canal du thread pour poster dans un thread.

:::tip
Les threads sont parfaits pour organiser les discussions — utilisez-les pour les systèmes de tickets, les retours ou les conversations thématiques.
:::`,

    dmTitle: 'Messages Privés',
    dmBody: `## Envoyer un MP

L\'action **Envoyer un MP** envoie un message privé à un utilisateur :

- **Utilisateur** — l\'utilisateur cible (utilisez \`{user}\` ou un ID spécifique)
- **Contenu** — le texte du message
- **Embed** — embed enrichi optionnel

:::warning
Certains utilisateurs ont les MPs désactivés. Votre workflow devrait gérer le cas où le MP échoue. Envisagez d\'ajouter un nœud condition pour vérifier les erreurs.
:::

:::tip
Cas courants de MP : messages de bienvenue à l\'arrivée, notifications de modération (raisons de kick/ban), codes de vérification.
:::`,

    // ── Interactions ──
    interactionsTitle: 'Interactions',
    interactionsDesc: 'Boutons, menus déroulants et modaux — rendez votre bot interactif.',
    buttonsTitle: 'Boutons',
    buttonsBody: `## Ajouter des boutons aux messages

Utilisez le composant **Ajouter un Bouton** dans une action Envoyer un Message :

- **Style** — Primaire (bleu), Secondaire (gris), Succès (vert), Danger (rouge), Lien (URL)
- **Label** — le texte du bouton
- **Identifiant personnalisé** — identifiant unique (pas nécessaire pour les boutons Lien)
- **Émoji** — émoji optionnel avant le label
- **Désactivé** — basculez pour rendre le bouton non-cliquable

## Lignes de boutons

- Jusqu\'à **5 boutons** par ligne
- Jusqu\'à **5 lignes** par message (25 boutons max)

## Gérer les clics

Connectez un **Gestionnaire de Bouton** avec l\'identifiant correspondant pour répondre quand les utilisateurs cliquent.

:::tip
Utilisez le style *Danger* pour les actions destructives (supprimer, bannir) afin de donner un avertissement visuel aux utilisateurs.
:::`,

    selectMenusTitle: 'Menus Déroulants',
    selectMenusBody: `## Types de menus déroulants

- **Menu à chaînes** — options personnalisées que vous définissez
- **Menu d\'utilisateurs** — permet de choisir des membres du serveur
- **Menu de rôles** — permet de choisir des rôles
- **Menu de canaux** — permet de choisir des canaux
- **Menu mentionnable** — utilisateurs ou rôles

## Configuration (Menu à chaînes)

- **Identifiant personnalisé** — identifiant unique
- **Texte indicatif** — texte grisé avant la sélection
- **Options** — label, valeur, description et émoji optionnel pour chacune
- **Min/Max valeurs** — combien d\'options peuvent être sélectionnées

:::tip
Les menus déroulants sont idéaux pour les panneaux de paramètres, les sélecteurs de rôles ou toute situation où les utilisateurs doivent choisir dans une liste.
:::`,

    modalsTitle: 'Modaux (Formulaires Popup)',
    modalsBody: `## Que sont les modaux ?

Les modaux sont des **formulaires popup** qui apparaissent par-dessus Discord. Ils ne peuvent être déclenchés que par un clic sur un bouton ou une interaction de commande slash.

## Configuration

- **Identifiant personnalisé** — identifiant unique
- **Titre** — affiché en haut du popup
- **Champs** — jusqu\'à 5 champs de saisie de texte

## Types d\'entrée texte

- **Court** — saisie sur une seule ligne
- **Paragraphe** — saisie multiligne

Chaque champ a :

- **Identifiant personnalisé** — pour récupérer la valeur
- **Label** — affiché au-dessus du champ
- **Texte indicatif** — texte d\'aide
- **Requis** — si l\'utilisateur doit le remplir
- **Min/Max longueur** — limites de caractères

:::tip
Les modaux sont parfaits pour les formulaires de retour, la création de tickets, les candidatures et les rapports de bugs.
:::`,

    // ── Modération ──
    moderationTitle: 'Modération',
    moderationDesc: 'Gardez votre serveur en sécurité — kicks, bans, timeouts et vérifications de permissions.',
    kickBanTitle: 'Kick & Ban',
    kickBanBody: `## Kick

L\'action **Expulser un Membre** retire un utilisateur du serveur (il peut revenir avec une invitation) :

- **Utilisateur** — qui expulser
- **Raison** — enregistrée dans le journal d\'audit Discord

## Ban

L\'action **Bannir un Membre** retire et bloque définitivement un utilisateur :

- **Utilisateur** — qui bannir
- **Raison** — raison dans le journal d\'audit
- **Supprimer les messages** — retirer leurs messages des 0-7 derniers jours

:::warning
Le rôle du bot doit être **plus haut** dans la hiérarchie des rôles que le rôle le plus élevé de l\'utilisateur cible. Le bot a aussi besoin des permissions **Expulser des Membres** et/ou **Bannir des Membres**.
:::

:::tip
Combinez avec un nœud **Condition** pour vérifier les rôles avant d\'expulser — ex. ne pas expulser les utilisateurs avec le rôle « Modérateur ».
:::`,

    timeoutMuteTitle: 'Timeout & Mute',
    timeoutMuteBody: `## Timeout

L\'action **Timeout un Membre** empêche temporairement un utilisateur d\'envoyer des messages ou de rejoindre un vocal :

- **Utilisateur** — membre cible
- **Durée** — combien de temps (1 minute à 28 jours)
- **Raison** — raison dans le journal d\'audit

## Retirer un timeout

Utilisez l\'action **Retirer le Timeout** ou définissez la durée à \`0\`.

:::info
Les timeouts sont la fonctionnalité de mute intégrée à Discord. Ils sont préférables au mute par rôle car ils :
- Affichent un compte à rebours à l\'utilisateur
- Expirent automatiquement
- Ne nécessitent pas de configuration d\'un rôle « Muet »
:::`,

    bulkDeleteTitle: 'Suppression en Masse',
    bulkDeleteBody: `L\'action **Suppression en Masse** supprime plusieurs messages à la fois :

- **Canal** — quel canal purger
- **Nombre** — nombre de messages à supprimer (2-100)
- **Filtre** — filtrer optionnellement par utilisateur ou contenu

## Limitations

- Impossible de supprimer des messages de **plus de 14 jours** (restriction de l\'API Discord)
- Maximum **100 messages** par action
- Nécessite la permission **Gérer les Messages**

:::tip
Combinez avec un **Gestionnaire de Commande** pour créer une commande /purge. Ajoutez une vérification de permission pour vous assurer que seuls les modérateurs peuvent l\'utiliser.
:::`,

    permissionsTitle: 'Vérification des Permissions',
    permissionsBody: `## Vérifier les permissions

Utilisez un nœud **Condition** pour vérifier les permissions avant d\'exécuter une action :

- **A le rôle** — vérifier si l\'utilisateur a un rôle spécifique
- **A la permission** — vérifier les permissions Discord (Gérer les Messages, Expulser, Bannir, etc.)
- **Est propriétaire** — vérifier si l\'utilisateur est le propriétaire du serveur

## Hiérarchie des permissions

Les permissions Discord suivent une hiérarchie :

1. Propriétaire du serveur (toutes les permissions)
2. Rôle Administrateur (toutes les permissions)
3. Permissions basées sur les rôles (le rôle le plus élevé l\'emporte)
4. Surcharges spécifiques au canal

:::warning
Ajoutez toujours des vérifications de permissions aux commandes de modération. Sans elles, n\'importe quel utilisateur pourrait utiliser vos workflows de kick/ban !
:::

:::tip
Créez une vérification « modérateur » réutilisable en combinant plusieurs conditions — ex. a le rôle Modérateur OU a la permission Gérer les Messages.
:::`,

    // ── Serveur ──
    guildTitle: 'Rôles & Serveur',
    guildDesc: 'Gérez les rôles, canaux, émojis et paramètres du serveur.',
    rolesTitle: 'Gestion des Rôles',
    rolesBody: `## Ajouter des rôles

L\'action **Ajouter un Rôle** donne un rôle à un membre :

- **Utilisateur** — membre cible
- **Rôle** — quel rôle ajouter

## Retirer des rôles

L\'action **Retirer un Rôle** enlève un rôle :

- **Utilisateur** — membre cible
- **Rôle** — quel rôle retirer

## Créer des rôles

L\'action **Créer un Rôle** crée un nouveau rôle :

- **Nom** — nom du rôle
- **Couleur** — code couleur hex
- **Permissions** — quelles permissions accorder
- **Hoist** — afficher séparément dans la liste des membres
- **Mentionnable** — permettre à tous de mentionner ce rôle

:::warning
Le rôle le plus élevé du bot doit être **au-dessus** du rôle cible dans la hiérarchie des rôles du serveur.
:::

:::tip
Utilisez les rôles avec l\'événement **guildMemberAdd** pour créer des workflows d\'auto-rôle — donner un rôle aux nouveaux membres à leur arrivée.
:::`,

    channelsTitle: 'Gestion des Canaux',
    channelsBody: `## Créer des canaux

L\'action **Créer un Canal** :

- **Nom** — nom du canal
- **Type** — texte, vocal, catégorie, annonce, stage, forum
- **Catégorie** — catégorie parente
- **Sujet** — description du canal (canaux texte)
- **Surcharges de permissions** — permissions par rôle ou par utilisateur

## Modifier des canaux

L\'action **Modifier un Canal** modifie un canal existant :

- Changer le nom, le sujet, le slowmode, le drapeau NSFW, etc.

## Supprimer des canaux

L\'action **Supprimer un Canal** supprime un canal définitivement.

:::warning
La suppression d\'un canal est **irréversible** ! Tous les messages du canal seront perdus. Envisagez d\'ajouter une étape de confirmation.
:::`,

    emojisStickersTitle: 'Émojis & Stickers',
    emojisStickersBody: `## Émojis personnalisés

L\'action **Créer un Émoji** upload un émoji personnalisé :

- **Nom** — nom de l\'émoji (alphanumérique et underscores)
- **Image** — URL ou base64 de l\'image
- **Rôles** — restreindre l\'utilisation à certains rôles (optionnel)

## Stickers

L\'action **Créer un Sticker** ajoute un sticker personnalisé :

- **Nom** — nom du sticker
- **Description** — ce que le sticker représente
- **Tags** — émoji associé pour les suggestions
- **Fichier** — l\'image du sticker (PNG, APNG ou Lottie)

:::info
Les serveurs gratuits sont limités à **50 émojis** et **5 stickers**. Les serveurs boostés ont plus de places.
:::`,

    invitesWebhooksTitle: 'Invitations & Webhooks',
    invitesWebhooksBody: `## Invitations

L\'action **Créer une Invitation** génère une invitation au serveur :

- **Canal** — vers quel canal l\'invitation mène
- **Utilisations max** — combien de fois elle peut être utilisée (0 = illimité)
- **Durée max** — temps d\'expiration en secondes (0 = jamais)
- **Temporaire** — expulser le membre quand il se déconnecte s\'il n\'a pas de rôle

## Webhooks

L\'action **Créer un Webhook** configure un webhook :

- **Canal** — canal cible
- **Nom** — nom d\'affichage du webhook
- **Avatar** — photo de profil du webhook

L\'action **Envoyer un Webhook** poste un message via webhook :

- **URL** — l\'URL du webhook
- **Contenu** — texte du message
- **Nom d\'utilisateur** — remplacer le nom du webhook
- **URL de l\'avatar** — remplacer la photo de profil

:::tip
Les webhooks sont parfaits pour les notifications entre serveurs, les systèmes de logs ou l\'envoi de messages qui semblent provenir d\'un utilisateur personnalisé.
:::`,

    // ── Vocal ──
    voiceTitle: 'Canaux Vocaux',
    voiceDesc: 'Rejoindre, quitter, jouer de l\'audio et gérer les connexions vocales.',
    joinLeaveTitle: 'Rejoindre & Quitter un Vocal',
    joinLeaveBody: `## Rejoindre un canal vocal

L\'action **Rejoindre un Vocal** connecte le bot à un canal vocal :

- **Canal** — quel canal vocal rejoindre
- **Sourdine propre** — si le bot se met en sourdine (recommandé)
- **Muet propre** — si le bot se mute

## Quitter

L\'action **Quitter le Vocal** déconnecte le bot de son canal vocal actuel.

:::info
Le bot a besoin des permissions **Se connecter** et **Parler** pour le canal vocal cible.
:::`,

    playAudioTitle: 'Jouer de l\'Audio',
    playAudioBody: `## Jouer de l\'audio

L\'action **Jouer de l\'Audio** diffuse de l\'audio dans un canal vocal :

- **Source** — URL vers un fichier ou flux audio
- **Volume** — volume de lecture (0-100%)

## Contrôles

- **Pause** — arrêter temporairement la lecture
- **Reprendre** — continuer la lecture
- **Stop** — arrêter complètement la lecture

:::tip
Les formats supportés incluent MP3, OGG et WAV. Pour de meilleures performances, utilisez des liens directs vers des fichiers audio.
:::`,

    moveDisconnectTitle: 'Déplacer & Déconnecter des Utilisateurs',
    moveDisconnectBody: `## Déplacer des utilisateurs

L\'action **Déplacer un Membre** transfère un utilisateur vers un autre canal vocal :

- **Utilisateur** — qui déplacer
- **Canal** — canal vocal de destination

## Déconnecter des utilisateurs

L\'action **Déconnecter un Membre** retire un utilisateur du vocal :

- **Utilisateur** — qui déconnecter

:::warning
Les deux actions nécessitent la permission **Déplacer des Membres**. Le bot ne peut pas déplacer des utilisateurs vers des canaux auxquels il n\'a pas accès.
:::`,

    // ── Bot ──
    botTitle: 'Paramètres du Bot',
    botDesc: 'Configurez la présence, l\'avatar et le pseudo de votre bot.',
    presenceTitle: 'Présence & Statut du Bot',
    presenceBody: `## Définir le statut

L\'action **Définir la Présence** change le statut en ligne de votre bot :

- **Statut** — En ligne, Inactif, Ne pas déranger ou Invisible
- **Type d\'activité** — Joue à, Diffuse, Écoute, Regarde, Participe à
- **Texte d\'activité** — ce à quoi le bot « joue », « regarde », etc.

## Présence dynamique

Utilisez des variables pour créer des messages de statut dynamiques :

- \`Joue avec {guild.memberCount} membres\`
- \`Regarde {guild.name}\`

:::tip
Définissez la présence dans un gestionnaire d\'événement **clientReady** pour qu\'elle soit appliquée à chaque démarrage du bot.
:::`,

    nicknameAvatarTitle: 'Pseudo & Avatar',
    nicknameAvatarBody: `## Changer le pseudo

L\'action **Définir le Pseudo** change le pseudo du bot dans un serveur spécifique :

- **Pseudo** — le nouveau nom d\'affichage (laissez vide pour réinitialiser)

## Changer l\'avatar

L\'action **Définir l\'Avatar** met à jour la photo de profil du bot :

- **URL de l\'image** — lien vers la nouvelle image d\'avatar

:::warning
Discord limite les changements d\'avatar à **deux par heure**. N\'utilisez pas cela dans des workflows fréquemment déclenchés !
:::`,

    // ── Logique ──
    logicTitle: 'Logique & Flux',
    logicDesc: 'Conditions, boucles, variables et manipulation de données.',
    conditionsTitle: 'Conditions (Si/Sinon)',
    conditionsBody: `Le nœud **Condition** vous permet de créer une logique de branchement — si quelque chose est vrai, faire X ; sinon, faire Y.

## Configuration

- **Valeur gauche** — la valeur à vérifier (ex. \`{user.id}\`)
- **Opérateur** — égal, différent, contient, supérieur à, inférieur à, etc.
- **Valeur droite** — la valeur de comparaison

## Sorties

- Chemin **Vrai** (poignée verte) — s\'exécute quand la condition est remplie
- Chemin **Faux** (poignée rouge) — s\'exécute quand elle ne l\'est pas

## Combiner des conditions

Enchaînez plusieurs nœuds condition pour une logique complexe :

- ET : connectez les conditions en série
- OU : connectez le même déclencheur à plusieurs branches de condition

:::tip
Utilisez les conditions pour vérifier les permissions, comparer des valeurs, filtrer des événements ou créer des réponses différentes basées sur la saisie de l\'utilisateur.
:::`,

    loopsTitle: 'Boucles',
    loopsBody: `Le nœud **Boucle** répète un ensemble d\'actions plusieurs fois.

## Types

- **Boucle For** — répéter un nombre fixe de fois
- **Pour Chaque** — itérer sur une liste (ex. membres du serveur, rôles)
- **Tant que** — répéter tant qu\'une condition est vraie

## Configuration

- **Compteur** (boucle for) — combien d\'itérations
- **Liste** (pour chaque) — les données à parcourir
- **Condition** (tant que) — vérifiée avant chaque itération

## Variables de boucle

À l\'intérieur de la boucle, vous pouvez accéder à :

- \`{loop.index}\` — numéro de l\'itération courante (commence à 0)
- \`{loop.value}\` — élément courant (boucles pour-chaque)
- \`{loop.length}\` — nombre total d\'itérations

:::warning
Évitez les boucles infinies ! Assurez-vous toujours que votre condition while deviendra éventuellement fausse. DisFlow a une limite de sécurité de 1000 itérations.
:::`,

    variablesTitle: 'Variables',
    variablesBody: `Les variables vous permettent de **stocker et réutiliser des données** dans votre workflow.

## Définir des variables

Utilisez l\'action **Définir une Variable** :

- **Nom** — nom de la variable (ex. \`compteur\`)
- **Valeur** — les données à stocker

## Utiliser des variables

Référencez les variables avec des accolades : \`{compteur}\`, \`{nomUtilisateur}\`, etc.

## Portée

- **Variables de workflow** — disponibles dans l\'exécution courante
- **Variables globales** — persistent entre les exécutions (stockées en base de données)

## Types de variables

- **Texte** — données textuelles
- **Nombre** — entiers et décimaux
- **Booléen** — vrai/faux
- **Tableau** — listes de valeurs
- **Objet** — paires clé-valeur

:::tip
Utilisez l\'action **Définir une Variable** juste après un déclencheur pour capturer et nommer les données importantes pour une utilisation ultérieure dans le workflow.
:::`,

    mathStringTitle: 'Opérations Mathématiques & Texte',
    mathStringBody: `## Opérations mathématiques

Le nœud **Math** effectue des calculs :

- **Addition / Soustraction / Multiplication / Division**
- **Modulo** — reste après division
- **Puissance** — exponentiation
- **Aléatoire** — générer un nombre aléatoire
- **Arrondi / Plancher / Plafond**
- **Min / Max** — de deux valeurs

## Opérations sur le texte

Le nœud **Texte** manipule les chaînes :

- **Majuscule / Minuscule**
- **Trim** — supprimer les espaces
- **Remplacer** — chercher et remplacer du texte
- **Diviser** — diviser le texte en tableau
- **Extraire** — extraire une portion
- **Longueur** — nombre de caractères
- **Contient** — vérifier si le texte contient une sous-chaîne

:::tip
Enchaînez les opérations Math et Texte avec des variables pour construire des réponses dynamiques basées sur les données.
:::`,

    httpWebhookTitle: 'Requêtes HTTP & Webhooks',
    httpWebhookBody: `## Faire des requêtes HTTP

L\'action **Requête HTTP** appelle des APIs externes :

- **Méthode** — GET, POST, PUT, DELETE, PATCH
- **URL** — l\'endpoint de l\'API
- **En-têtes** — en-têtes personnalisés (ex. Authorization)
- **Corps** — payload de la requête (JSON)

## Réponse

La réponse est disponible comme variables :

- \`{http.status}\` — code de statut
- \`{http.body}\` — corps de la réponse
- \`{http.headers}\` — en-têtes de la réponse

## Exemple : Bot météo

1. Gestionnaire de Commande : /meteo {ville}
2. Requête HTTP : GET https://api.example.com/weather?city={args.ville}
3. Envoyer un Message : La météo à {args.ville} est de {http.body.temp}°C

:::warning
Soyez prudent avec les APIs externes — elles peuvent limiter vos requêtes. Ajoutez une gestion d\'erreurs pour les requêtes échouées.
:::`,

    // ── Base de données ──
    databaseTitle: 'Base de Données',
    databaseDesc: 'Stockez et interrogez des données persistantes avec la base de données intégrée de votre bot.',
    sqlBasicsTitle: 'Bases de la Base de Données',
    sqlBasicsBody: `DisFlow fournit à chaque bot une **base de données MySQL intégrée** pour le stockage persistant de données.

## Que pouvez-vous stocker ?

- Profils utilisateurs et niveaux
- Économie (pièces, inventaire)
- Avertissements et logs de modération
- Paramètres personnalisés par serveur
- Toute donnée structurée dont votre bot a besoin

## Accéder à la base de données

1. Dans l\'Éditeur de Workflow, utilisez les nœuds **Base de données** (Créer une Table, Select, Insert, Update, Delete)
2. Depuis le Tableau de bord, utilisez le **Visualiseur de Base de Données** pour parcourir les tables

:::tip
Planifiez la structure de votre base de données avant de construire. Réfléchissez aux données que vous devez stocker et comment elles sont liées.
:::`,

    createTableTitle: 'Créer des Tables',
    createTableBody: `L\'action **Créer une Table** met en place une nouvelle table de base de données.

## Configuration

- **Nom de la table** — alphanumérique et underscores (ex. \`niveaux_utilisateurs\`)
- **Colonnes** — définissez chaque colonne avec :
  - **Nom** — nom de la colonne
  - **Type** — INT, VARCHAR(255), TEXT, BOOLEAN, DATETIME, etc.
  - **Clé primaire** — identifiant unique
  - **Auto-incrément** — assigner automatiquement les IDs
  - **Défaut** — valeur par défaut
  - **Non null** — exiger une valeur

## Exemple : Table de niveaux utilisateurs

- \`id\` — INT, clé primaire, auto-incrément
- \`user_id\` — VARCHAR(20), non null
- \`guild_id\` — VARCHAR(20), non null
- \`xp\` — INT, défaut 0
- \`level\` — INT, défaut 1

:::info
Les tables sont créées par bot. Chaque bot a sa propre base de données isolée.
:::`,

    selectInsertTitle: 'Interroger les Données',
    selectInsertBody: `## SELECT (lire les données)

L\'action **Select** récupère des données :

- **Table** — quelle table interroger
- **Colonnes** — quelles colonnes retourner (* pour toutes)
- **Where** — conditions pour filtrer les résultats
- **Trier par** — trier les résultats
- **Limite** — nombre maximum de lignes à retourner

Les résultats sont disponibles comme \`{db.rows}\` (tableau) et \`{db.rows[0].nomColonne}\`.

## INSERT (écrire des données)

L\'action **Insert** ajoute une nouvelle ligne :

- **Table** — table cible
- **Valeurs** — paires clé-valeur pour chaque colonne

## UPDATE

L\'action **Update** modifie des lignes existantes :

- **Table** — table cible
- **Set** — quelles colonnes changer
- **Where** — quelles lignes mettre à jour

## DELETE

L\'action **Delete** supprime des lignes :

- **Table** — table cible
- **Where** — quelles lignes supprimer

:::warning
Utilisez toujours une clause WHERE avec UPDATE et DELETE pour éviter d\'affecter toutes les lignes !
:::`,

    dbViewerTitle: 'Visualiseur de Base de Données',
    dbViewerBody: `Le **Visualiseur de Base de Données** est disponible depuis la barre latérale du Tableau de bord.

## Fonctionnalités

- **Parcourir les tables** — voir toutes les tables d\'un bot
- **Voir les données** — vue paginée des lignes
- **Rechercher** — filtrer les lignes par valeurs de colonnes
- **Modifier** — modifier les valeurs directement dans le visualiseur
- **Supprimer** — retirer des lignes depuis l\'interface
- **Exporter** — télécharger les données de la table en CSV

## Accéder au visualiseur

1. Allez dans **Tableau de bord → Bases de données**
2. Sélectionnez un bot pour voir ses tables
3. Cliquez sur un nom de table pour parcourir ses données

:::tip
Utilisez le Visualiseur de Base de Données pour le débogage — vérifiez si vos workflows lisent et écrivent correctement les données.
:::`,

    // ── Avancé ──
    advancedTitle: 'Fonctionnalités Avancées',
    advancedDesc: 'Exécution de code, chat IA, templates et fonctionnalités avancées.',
    codeExecTitle: 'Exécution de Code Personnalisé',
    codeExecBody: `Le nœud **Code** vous permet d\'écrire du JavaScript personnalisé qui s\'exécute dans votre workflow.

## Configuration

- **Code** — votre code JavaScript
- **Entrées** — variables disponibles dans le code
- **Sortie** — le nom de la variable pour stocker le résultat

## APIs disponibles

À l\'intérieur du nœud code, vous avez accès à :

- \`inputs\` — les variables que vous avez définies
- \`return\` — retourner une valeur à stocker dans la variable de sortie

## Exemple : Couleur aléatoire

\`\`\`javascript
const couleurs = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
return couleurs[Math.floor(Math.random() * couleurs.length)];
\`\`\`

:::warning
Le code s\'exécute dans un environnement sandboxé. Vous ne pouvez pas accéder au système de fichiers, au réseau ou aux modules Node.js.
:::`,

    canvasCardTitle: 'Canvas Cards & Organisation',
    canvasCardBody: `## Grouper des nœuds

Utilisez les **Canvas Cards** (groupes) pour organiser visuellement votre workflow :

- Sélectionnez plusieurs nœuds (Shift + clic)
- Clic droit → « Grouper la Sélection »
- Donnez un nom et une couleur au groupe

## Avantages

- Regroupez les nœuds liés ensemble
- Ajoutez des descriptions pour expliquer les sections
- Réduisez les groupes pour simplifier la vue
- Déplacez les groupes comme une seule unité

:::tip
Utilisez les groupes pour séparer les différentes fonctionnalités — ex. un groupe pour le système de bienvenue, un autre pour la modération, et un autre pour le système de niveaux.
:::`,

    templatesTitle: 'Templates',
    templatesBody: `Les templates sont des **workflows pré-construits** que vous pouvez insérer dans votre canevas en un clic.

## Utiliser les templates

1. Ouvrez l\'onglet **Templates** dans la barre latérale gauche
2. Parcourez par catégorie ou recherchez par nom
3. Cliquez sur **Insérer** pour ajouter le template à votre canevas

## Catégories disponibles

- **Modération** — kick, ban, avertissement, purge
- **Utilisateur** — bienvenue, au revoir, niveaux
- **Serveur** — auto-rôle, logs, retours
- **Utilitaire** — ping, aide, commandes d\'info

## Personnaliser les templates

Après avoir inséré un template :

1. Examinez les nœuds et connexions
2. Modifiez les paramètres (noms de canaux, messages, etc.)
3. Sauvegardez et déployez

:::tip
Les templates sont un excellent point de départ. Insérez-en un, apprenez de la disposition des nœuds, et personnalisez-le selon vos besoins.
:::`,

    aiChatTitle: 'Assistant IA',
    aiChatBody: `Le **Chat IA** est disponible depuis la barre inférieure de l\'Éditeur de Workflow.

## Comment il peut vous aider

- **Expliquer des nœuds** — demandez ce que fait un nœud spécifique
- **Suggérer des workflows** — décrivez ce que vous voulez et obtenez un guide étape par étape
- **Déboguer des problèmes** — collez une erreur et obtenez de l\'aide pour la résoudre
- **Répondre à des questions** — tout ce qui concerne DisFlow ou les bots Discord

## Comment l\'utiliser

1. Cliquez sur le bouton **Chat IA** dans la barre inférieure
2. Tapez votre question ou décrivez ce que vous voulez construire
3. L\'IA répond avec des explications et suggestions

:::tip
Soyez précis dans vos questions ! Au lieu de « Comment faire un bot ? », demandez « Comment créer une commande /ban qui vérifie les permissions de modérateur ? »
:::`,

    // ── Déploiement ──
    deploymentTitle: 'Déploiement',
    deploymentDesc: 'Sauvegardez, déployez et résolvez les problèmes de vos workflows.',
    saveDeployTitle: 'Sauvegarder & Déployer',
    saveDeployBody: `## Sauvegarder

Cliquez sur le bouton **Sauvegarder** (ou Ctrl + S) pour enregistrer votre workflow. Cela stocke vos nœuds, connexions et configurations.

## Déployer

Cliquez sur le bouton **Déployer** pour pousser votre workflow vers votre bot en production :

1. Le bot se reconstruit automatiquement avec vos dernières modifications
2. Il redémarre et se reconnecte à Discord
3. Vos nouveaux workflows sont actifs

## Quelle est la différence ?

- **Sauvegarder** — enregistre votre travail mais n\'affecte pas le bot en cours d\'exécution
- **Déployer** — pousse les changements sauvegardés vers le bot en production

:::tip
Sauvegardez fréquemment pendant l\'édition ! Ne déployez que quand vous êtes prêt à mettre en production vos changements.
:::

:::warning
Le déploiement redémarre le bot. Il y aura un bref moment où le bot est hors ligne (généralement moins de 10 secondes).
:::`,

    collaborationTitle: 'Collaboration & Partage',
    collaborationBody: `## Partager des workflows

Vous pouvez partager des workflows avec d\'autres utilisateurs DisFlow :

1. **Exportez** votre workflow en JSON
2. Envoyez le fichier à votre collaborateur
3. Il **l\'importe** dans son éditeur

## Fonctionnalités d\'équipe

- **Page Membres** — invitez des membres d\'équipe pour gérer vos bots
- **Accès par rôle** — assignez des rôles éditeur ou lecteur
- **Journal d\'activité** — voyez qui a fait des changements et quand

:::info
Les fonctionnalités de collaboration en équipe peuvent varier selon votre plan d\'abonnement.
:::`,

    troubleshootingTitle: 'Résolution de Problèmes',
    troubleshootingBody: `## Problèmes courants

### Le bot ne se connecte pas
- Vérifiez que votre **token** est correct et n\'a pas expiré
- Vérifiez que les **intents** requis sont activés
- Assurez-vous que le bot a été **invité** sur votre serveur

### Les commandes slash n\'apparaissent pas
- Discord met en cache les commandes — attendez jusqu\'à **1 heure** pour les nouvelles commandes
- Vérifiez que le bot a le scope **applications.commands**
- Vérifiez que le nom de la commande n\'est pas en conflit avec d\'autres bots

### Le bot ne répond pas
- Vérifiez la **Console** (barre inférieure) pour les messages d\'erreur
- Vérifiez que tous les nœuds sont **connectés** correctement
- Assurez-vous que les champs de configuration requis sont remplis
- Vérifiez les paramètres de **permissions** dans Discord

### Erreurs de workflow
- Ouvrez la **Console** pour voir les logs d\'erreur détaillés
- Vérifiez s\'il y a des nœuds déconnectés
- Vérifiez que les noms de variables sont correctement orthographiés
- Assurez-vous que les tables de base de données existent avant de les interroger

:::tip
La Console est votre meilleur outil de débogage ! Elle affiche les logs en temps réel de tout ce que fait votre bot. Ouvrez-la depuis la barre inférieure de l\'Éditeur de Workflow.
:::

## Toujours bloqué ?

- Consultez le serveur **Discord** de support pour l\'aide de la communauté
- Parcourez cette documentation pour des guides détaillés
- Utilisez l\'assistant **Chat IA** dans l\'éditeur`,
  },
};

export default fr;
