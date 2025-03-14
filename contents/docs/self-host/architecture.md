---
title: Architecture
sidebarTitle: Architecture
sidebar: Docs
showTitle: true
---

This document gives an overview of how a deployed PostHog [Helm chart](https://github.com/PostHog/charts-clickhouse/) works on Kubernetes.

The general architecture looks as follows:

```mermaid
flowchart TD
    classDef sgraph fill-opacity:0,stroke-width:3px,stroke-dasharray:5,stroke:#000

    subgraph K8s ["K8s PostHog namespace"]
        Ingress(Ingress)
        PG[(Postgres Stateful service)]
        Kafka[(Kafka Stateful Service)]

        KafkaEvents[(Kafka Stateful Service)]
        Redis[(Redis SS)]

        ServiceLB([Service Load Balancer])
        ServiceLBReads([Service Load Balancer])

        subgraph ServicesDB [K8s Services]
            PGBouncer
        end

        subgraph CH ["ClickHouse Cluster (Operator Managed)"]
            CH1[(Replica 1 Shard 1)]
            CH2[(Replica 1 Shard 2)]
            CH3[(Replica 2 Shard 1)]
            CH4[(Replica 2 Shard 2)]
        end

        subgraph ZK [K8s ZooKeeper cluster]
            ZK1
            ZK2
            ZK3
        end

        subgraph AppServices [K8s Services]
            Events(Events Service)
            App(Web Service)

            na %% Invisible helper node
        end


        subgraph WorkerServices [K8s Services]
            Plugins[Plugin Service]
            Worker[Worker Service]
        end
    end

    AppServices --> ServiceLB --> ServicesDB --> PG

    Events --> KafkaEvents --> Plugins --> Kafka --Write path--> CH
    WorkerServices --> ServiceLBReads
    WorkerServices --> ServiceLB
    ServiceLBReads --Read path--> CH


    AppServices --> ServiceLBReads

    CH --> ZK

    CH1 <--> CH2
    CH3 <--> CH4

    ClientApps(Client Apps)--- Ingress

    %% KLUDGE: Use invisible nodes for styling purposes
    Ingress --- na[ ]
    na --Other traffic--> App
    na --Events endpoint --> Events
    style na height:0px,width:0px

    Redis -.- WorkerServices
    AppServices -.- Redis

    AppServices-.Optional Utilization telemetry.->Telemetry(Posthog License Telemetry service)

    class K8s,ServicesDB,CH,ZK,AppServices,WorkerServices sgraph;

```

No communication is needed into or out of this namespace other than the ingress controller for app and collecting data.

Note that the specifics of this may vary:

-   ClickHouse, Kafka, PostgreSQL and Redis services may be hosted outside of the namespace or [configured differently](/docs/self-host/deploy/configuration).
-   The ClickHouse cluster is managed by [clickhouse-operator](https://github.com/Altinity/clickhouse-operator/) and the
    exact number of pods vary according to [sharding settings](/docs/runbook/services/clickhouse/sharding-and-replication).

Event ingestion is explained in more depth in our engineering handbook [here](/handbook/engineering/databases/event-ingestion).
