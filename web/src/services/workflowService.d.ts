export function getWorkflows(): Promise<any[]>;
export function createWorkflow(data: any): Promise<any>;
export function getWorkflow(id: number): Promise<any>;
export function updateWorkflow(id: number, data: any): Promise<any>;
export function deleteWorkflow(id: number): Promise<void>;
export function deployWorkflow(id: number): Promise<{ deploying: boolean; botId: number | null } | null>;
