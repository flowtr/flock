import axios, { AxiosInstance } from "axios";

export type ICaddyHandler =
    | {
          handler: "reverse_proxy";
          upstreams: [
              {
                  dial: string;
              }
          ];
      }
    | {
          handler: "subroute";
          routes: ICaddyRoute[];
      };

export interface ICaddyMatcher {
    host: string[];
}

export interface ICaddyRoute {
    match?: ICaddyMatcher[];
    handle: ICaddyHandler[];
}

export interface ICaddyConfig {
    apps: {
        http: {
            servers: Record<
                string,
                {
                    listen: `:${number}`[];
                    routes: ICaddyRoute[];
                }
            >;
        };
    };
}

export class CaddyApi {
    protected readonly api: AxiosInstance;

    constructor(
        baseUrl = "http://caddy-api-service.caddy-system.svc.cluster.local"
    ) {
        this.api = axios.create({
            baseURL: baseUrl,
        });
    }

    async init() {
        const data: ICaddyConfig = {
            apps: {
                http: {
                    servers: {
                        srv0: {
                            listen: [":443"],
                            routes: [],
                        },
                    },
                },
            },
        };

        await this.setConfig(data);
    }

    async getConfig(): Promise<ICaddyConfig> {
        return (await this.api.get<ICaddyConfig>("/config")).data;
    }

    async setConfig(data: ICaddyConfig) {
        return await this.api.post("/config", data);
    }

    async addService(
        service: string,
        hosts: string[],
        port = 80,
        namespace = "default"
    ) {
        const route: ICaddyRoute = {
            match: [{ host: hosts }],
            handle: [
                {
                    handler: "subroute",
                    routes: [
                        {
                            handle: [
                                {
                                    handler: "reverse_proxy",
                                    upstreams: [
                                        {
                                            dial: `${service}.${namespace}.svc.cluster.local:${port}`,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
        const existingConfig = await this.getConfig();
        existingConfig.apps.http.servers["srv0"].routes.push(route);

        return await this.setConfig(existingConfig);
    }
}
