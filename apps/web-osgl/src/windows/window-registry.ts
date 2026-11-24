export interface WindowSize {
  readonly width: number;
  readonly height: number;
}

export interface WindowAppDescriptor {
  readonly appId: string;
  readonly title: string;
  readonly category: string;
  readonly icon: string;
  readonly defaultSize: WindowSize;
  readonly minSize: WindowSize;
  readonly fullBleed: boolean;
  readonly render: () => React.JSX.Element;
}

export class WindowRegistry {
  private readonly apps = new Map<string, WindowAppDescriptor>();

  register(descriptor: WindowAppDescriptor): void {
    this.apps.set(descriptor.appId, descriptor);
  }

  list(): readonly WindowAppDescriptor[] {
    return [...this.apps.values()];
  }

  get(appId: string): WindowAppDescriptor | null {
    return this.apps.get(appId) ?? null;
  }
}

export const windowRegistry = new WindowRegistry();
