import k8s from "@kubernetes/client-node";

export interface CaddyConfig {
    ports: number[];
}

export const deployCaddy = async (
    kc: k8s.KubeConfig,
    config: Partial<CaddyConfig>
) => {
    const caddyConfig: CaddyConfig = {
        ports: [80, 443],
        ...config,
    };

    const coreApi = kc.makeApiClient(k8s.CoreV1Api);
    const appsApi = kc.makeApiClient(k8s.AppsV1Api);

    const existingNamespaces = await coreApi.listNamespace();
    if (
        !existingNamespaces.body.items.some(
            (n) => n.metadata?.name === "caddy-system"
        )
    )
        await coreApi.createNamespace({
            metadata: {
                name: "caddy-system",
                labels: {
                    name: "caddy-system",
                },
            },
        });

    const deployment: k8s.V1Deployment = {
        metadata: {
            name: "caddy",
        },
        spec: {
            replicas: 1,
            selector: {
                matchLabels: {
                    app: "caddy",
                },
            },
            template: {
                metadata: {
                    labels: {
                        app: "caddy",
                    },
                },
                spec: {
                    containers: [
                        {
                            name: "caddy",
                            image: "caddy:alpine",
                            ports: [
                                {
                                    containerPort: 80,
                                },
                                {
                                    containerPort: 443,
                                },
                                {
                                    containerPort: 2019,
                                },
                            ],
                        },
                    ],
                },
            },
        },
    };
    const service: k8s.V1Service = {
        metadata: {
            name: "caddy-service",
        },
        spec: {
            selector: {
                app: "caddy",
            },
            type: "LoadBalancer",
            ports: [
                {
                    name: "http",
                    protocol: "TCP",
                    port: 80,
                    targetPort: 80 as never,
                },
                {
                    name: "https",
                    protocol: "TCP",
                    port: 443,
                    targetPort: 443 as never,
                },
            ],
        },
    };
    const apiService: k8s.V1Service = {
        metadata: {
            name: "caddy-api-service",
        },
        spec: {
            selector: {
                app: "caddy",
            },
            type: "ClusterIP",
            ports: [
                {
                    name: "api",
                    protocol: "TCP",
                    port: 2019,
                    targetPort: 2019 as never,
                },
            ],
        },
    };
    const existingDeployments = await appsApi.listNamespacedDeployment(
        "caddy-system"
    );

    if (
        existingDeployments.body.items.some(
            (dep) => dep.metadata?.name === "caddy"
        )
    ) {
        // The services already exist, update them
        await appsApi.replaceNamespacedDeployment(
            "caddy",
            "caddy-system",
            deployment
        );
        await coreApi.replaceNamespacedService(
            "caddy-service",
            "caddy-system",
            service
        );
        await coreApi.replaceNamespacedService(
            "caddy-api-service",
            "caddy-system",
            apiService
        );
    } else {
        await appsApi.createNamespacedDeployment("caddy-system", deployment);
        await coreApi.createNamespacedService("caddy-system", service);
        await coreApi.createNamespacedService("caddy-system", apiService);
    }
};
