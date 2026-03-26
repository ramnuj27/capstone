export type PortalNavigationItem = {
    title: string;
    description: string;
    href: string;
    icon: string;
    group: string;
};

export type PortalOverview = {
    title: string;
    description: string;
    scope: string;
    chips: string[];
};

export type PortalContentCard = {
    title: string;
    description: string;
};

export type PortalMapFocus = {
    city: string;
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    styleId: string;
    title: string;
    description: string;
    note: string;
};

export type PortalModuleMetric = {
    label: string;
    value: string;
    helper: string;
};

export type PortalModuleRow = {
    primary: string;
    secondary: string;
    meta: string;
};

export type PortalModuleSection = {
    title: string;
    rows: PortalModuleRow[];
};

export type PortalModuleWorkspace = {
    title: string;
    metrics: PortalModuleMetric[];
    sections: PortalModuleSection[];
} | null;

export type PortalSharedData = {
    navigation: PortalNavigationItem[];
    overview: PortalOverview;
} | null;
