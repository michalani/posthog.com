---
title: Upgrade notes
sidebar: Docs
showTitle: true
---

### 26.0.0

This version upgrades the Prometheus service from version `2.31.1` to `2.36.2`. As part of this upgrade, we've also changed some default values in the `prometheus` stanza:

-   `prometheus.alertmanager`
-   `prometheus.kubeStateMetrics`
-   `prometheus.nodeExporter`
-   `prometheus.alertmanagerFiles`

now defaults as the upstream Helm chart.

Additionally `prometheus.serverFiles.alerting_rules.yml` has now new defaults that from now on we will consider _UNSTABLE_. Alerting is an important part of any production system. With this Helm chart, we aim to provide a good collection of default rules that can be used to successfully alert an operator if a PostHog installation is not working as expected. As those rules will probably evolve over time and as we don’t want to cut a new major release every time it happens, please consider the default values of this input variable as _UNSTABLE_. Please consider to explicitly override this input in your `values.yaml` if you need to keep it stable.

### 25.0.0

This version upgrades the PgBouncer service from version `1.12.0` to `1.17.0`. As part of this upgrade, we've migrated from the container image `edoburu/pgbouncer:1.12.0` to `bitnami/pgbouncer:1.17.0`. If you are not overriding `pgbouncer.env` values, **there's nothing you need to do**. Otherwise, please remember to verify if those are working with the [new container image](https://hub.docker.com/r/bitnami/pgbouncer).

### 24.0.0

This version changes the supported Kubernetes version to >=1.22 <= 1.24 by dropping the support for Kubernetes 1.21 as it has reached end of life on 2022-06-28.

### 23.4.0

Updated the app version to 1.37.0 which requires the async migration 0004 to be completed, head over to `/instance/async_migrations` and make sure you run that before updating.

### 23.0.0

This version changes the default ClickHouse service type from `NodePort` to `ClusterIP`. This is to remove the possibility of exposing the service in environments where the Kubernetes nodes are not deployed in private subnets or when they are deployed in public subnets but without any network restriction in place.

If you are not overriding the `clickhouse.serviceType` **there's nothing you need to do**. If you are overriding it using either `LoadBalancer` or `NodePort` please remember to keep your installation secure by:

-   deploying your Kubernetes nodes in private subnet(s) or restrict access to those via firewall rules
-   restrict network access to the load balancer
-   add authentication to the load balancer
-   configure TLS for ClickHouse
-   provide a unique ClickHouse login by overriding the `clickhouse.user` and `clickhouse.password` values
-   restrict access to the ClickHouse cluster, ClickHouse offers settings for
    restricting the ips/hosts that can access the cluster. See the
    [`user_name/networks`](https://clickhouse.com/docs/en/operations/settings/settings-users/#user-namenetworks) setting for details. We expose this setting
    via the Helm Chart as `clickhouse.allowedNetworkIps`

For other suggestions and best practices take a look at our docs:

-   [PostHog chart configuration](/docs/self-host/deploy/configuration)
-   [Securing PostHog](/docs/)

We'd like to thank Alexander Nicholson and the team at TableCheck for sharing their POC with us, which allowed us to quickly reproduce and address this issue.

### 22.0.0

This version upgrades ClickHouse from version `21.6.5` to `22.3.6.5`. This update brings several improvements to the overall service. For more info, you can look at the [upstream changelog](https://clickhouse.com/docs/en/whats-new/changelog/#clickhouse-release-v223-lts-2022-03-17).

Note: the ClickHouse pod(s) will be reprovisioned as part of this upgrade. We expect no downtime for the ingestion pipeline.

### 21.0.0

This version changes the supported Kubernetes version to >=1.21 <= 1.24:

-   drops support for Kubernetes 1.20 as it has reached end of life on 2022-02-28
-   adds support for Kubernetes 1.24 released on 2022-05-24

### 20.0.0

This version upgrades the [`altinity/clickhouse-operator`](https://github.com/Altinity/clickhouse-operator) from version `0.16.1` to `0.18.4`. This brings some updates to the custom resource definition (CRD). In order to keep everything in sync, please run the following steps before updating your Helm release:

1. Download and extract the Helm chart release source code

    ```
    mkdir -p posthog-crd-upgrade
    wget -qO- https://github.com/PostHog/charts-clickhouse/archive/refs/tags/posthog-20.0.0.tar.gz | tar xvz - --strip 1 -C posthog-crd-upgrade
    ```

1. Update the `altinity/clickhouse-operator` CRDs by running:

    ```
    kubectl apply \
        -f posthog-crd-upgrade/charts/posthog/crds/clickhouseinstallations.clickhouse.altinity.com.yaml \
        -f posthog-crd-upgrade/charts/posthog/crds/clickhouseinstallationtemplates.clickhouse.altinity.com.yaml \
        -f posthog-crd-upgrade/charts/posthog/crds/clickhouseoperatorconfigurations.clickhouse.altinity.com.yaml
    ```

    Note: you'll likely see a warning like:

    ```
    Warning: resource customresourcedefinitions/clickhouseinstallations.clickhouse.altinity.com is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
    customresourcedefinition.apiextensions.k8s.io/clickhouseinstallations.clickhouse.altinity.com configured

    Warning: resource customresourcedefinitions/clickhouseinstallationtemplates.clickhouse.altinity.com is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
    customresourcedefinition.apiextensions.k8s.io/clickhouseinstallationtemplates.clickhouse.altinity.com configured

    Warning: resource customresourcedefinitions/clickhouseoperatorconfigurations.clickhouse.altinity.com is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
    customresourcedefinition.apiextensions.k8s.io/clickhouseoperatorconfigurations.clickhouse.altinity.com configured
    ```

    but this is safe to be ignored.

1. You can now move on with the Helm update as usual:
    ```
    helm repo update posthog
    helm upgrade --install -f ...
    ```
    Note: the ClickHouse pod will not be restarted but the `clickhouse-operator` will, no downtime is expected as part of this release.

### 19.0.0

This version upgrades the Redis dependency chart from version `14.6.2` to `16.8.9` and upgrades Redis from version `6.2.4` to `6.2.7`.

The [upstream changelog](https://github.com/bitnami/charts/tree/master/bitnami/redis#upgrading) includes changes that shouldn't be relevant to the majority of our users but if you are overriding any of the values listed in the changelog, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

### 18.0.0

This version requires 3 [async migrations](https://posthog.com/docs/self-host/configure/async-migrations/overview) to be completed.

If you're on PostHog app version 1.33 head over to `/instance/async_migrations` and run first the three required migrations.

If you're on a PostHog app version < 1.33:

1. upgrade to chart version 16.x.x first (example: use `--version 16.1.0` in the `helm upgrade` command)
2. run the async migrations at `/instance/async_migrations`
3. continue the upgrade process as usual

### 17.0.0

This version upgrades the Kafka dependency chart from version `12.6.0` to `14.9.3` and upgrades Kafka to version `2.8.1`.

The [upstream changelog](https://github.com/bitnami/charts/tree/master/bitnami/kafka#upgrading) includes changes that shouldn't be relevant to the majority of our users but if you are overriding `kafka.image` or `kafka.provisioning`, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

Note: the Kafka pod will be reprovisioned as part of this upgrade and the ingestion pipeline will experience a brief downtime.

### 16.0.0

This version improves the configuration of Kafka.

The built-in Kafka service type default is now `ClusterIP` from the previous `NodePort`. If you were relying on this setting you can override the new default by setting `kafka.service.type` to `NodePort`.

As part of this work, we have also renamed a few chart inputs in order to reduce confusion and align our naming convention to the industry standards:

-   `kafka.url`, `kafka.host`, `kafka.port` have been consolidated into the `externalKafka.brokers` variable.

If you are overriding any of those values, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

### 15.0.0

This version renamed the `prometheus-statsd-exporter` subchart alias from `statsd` to the default (`prometheus-statsd-exporter`).

As part of this work, we've also:

-   deprecated all the resources in the `metrics` namespace
-   added the possibility to use an external `statsd` service by using the `externalStatsd` variable

If you are using the `statsd` or the `metrics` variables, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

### 14.0.0

This version fixes customizing PostgreSQL installation, previously many `values.yaml` values did not work as expected.

As part of this work, the following chart inputs have changed:

-   `postgresql.postgresqlHost` -> `externalPostgresql.postgresqlHost`
-   `postgresql.postgresqlPort` -> `externalPostgresql.postgresqlPort`
-   `postgresql.postgresqlUsername` -> `externalPostgresql.postgresqlUsername`
-   Existing `postgresql.postgresqlUsername` was removed as PostHog requires admin access to the postgresql cluster to install extensions.
-   `postgresql.existingSecret` will now work after 14.0.0
-   `postgresql.existingSecretKey` was removed. This did not previously work.

If you are overriding any of those values, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

### 13.0.0

This version fixes connecting to an external ClickHouse cluster. You can now also specify a secret containing the external ClickHouse service password.

As part of this work, the following chart inputs have changed:

-   `clickhouse.host` -> `externalClickhouse.host`
-   `clickhouse.enabled` now toggles the internal ClickHouse cluster on/off. If this is off, you will need to specify an external clickhouse cluster.
-   `clickhouse.database` was previously used as the cluster name as well. Now `clickhouse.cluster` has been introduced.
-   `clickhouse.user` is now usable
-   `clickhouse.replication` was removed

If you are overriding any of those values, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

### 12.0.0

This version fixes a couple of long standing bugs related to the Redis service setup. You can now provide a Redis password (or a pointer to a Kubernetes secret containing it) directly in your `values.yaml` file.

As part of this work, we have also renamed a few chart inputs in order to reduce confusion and align our naming convention to the industry standards:

-   `redis.host` -> `externalRedis.host`
-   `redis.port` -> `externalRedis.port`
-   `redis.password` -> `externalRedis.password`

If you are overriding any of those values, please make the corresponding changes before upgrading. Otherwise **there's nothing you need to do**.

### 11.0.0

This version removes some legacy Helm annotations not needed anymore. By removing those and upgrading your installation, all future upgrades to stateless components should now happen without downtime (see [#179](https://github.com/PostHog/charts-clickhouse/pull/179) for more info).

Before running the Helm upgrade command, please run the following script first (replace the `RELEASE_NAME` and `RELEASE_NAMESPACE` accordingly if you are using a custom release name/namespace, which can be found via `helm list`):

```
#!/usr/bin/env sh

RELEASE_NAME="posthog"
RELEASE_NAMESPACE="posthog"

for deployment in $(kubectl -n "$RELEASE_NAMESPACE" get deployments --no-headers -o custom-columns=NAME:.metadata.name | grep "posthog")
do
  kubectl -n "$RELEASE_NAMESPACE" label deployment "$deployment" "app.kubernetes.io/managed-by=Helm"
  kubectl -n "$RELEASE_NAMESPACE" annotate deployment "$deployment" "meta.helm.sh/release-name=$RELEASE_NAME"
  kubectl -n "$RELEASE_NAMESPACE" annotate deployment "$deployment" "meta.helm.sh/release-namespace=$RELEASE_NAMESPACE"
done
```

Note: you can safely ignore errors like `error: --overwrite is false but found the following declared annotation(s): 'meta.helm.sh/release-name' already has a value (posthog)`

After that you continue the Helm upgrade process as usual.

### 10.0.0

This version introduces two major changes:

1. as of today we've been including additional `StorageClass` definition into our Helm chart when installing it on AWS or GCP platforms. Starting from this release, we will not do that anymore and we will rely on the cluster default storage class. If you still want to install those additional storage classes, simply set `installCustomStorageClass: true` in your `values.yaml`. If you are planning to use the default storage class, make sure you are running with our [requirement settings](https://posthog.com/docs/self-host/deploy/aws#cluster-requirements) (`allowVolumeExpansion` set to `true` and `reclaimPolicy` set to `Retain`).

2. we have renamed few chart inputs in order to reduce confusion and align our naming convention to the industry standards:

    - `clickhouseOperator.enabled` -> `clickhouse.enabled`
    - `clickhouseOperator.namespace` -> `clickhouse.namespace`
    - `clickhouseOperator.storage` -> `clickhouse.persistence.size`
    - `clickhouseOperator.useNodeSelector` -> `clickhouse.useNodeSelector`
    - `clickhouseOperator.serviceType` -> `clickhouse.serviceType`
    - `clickhouse.persistentVolumeClaim` -> `clickhouse.persistence.existingClaim`

    If you are overriding any of those, please make the corresponding changes before upgrading. Depending on your settings and setup, during this upgrade the ClickHouse pod might get recreated.

### 9.0.0

This version changes the supported Kubernetes version to >=1.20 <= 1.23:

-   drops support for Kubernetes 1.19 as it has reached end of life on 2021-10-28
-   adds support for Kubernetes 1.23 released on 2021-12-07

### 8.0.0

This version deprecates the `beat` deployment ([#184](https://github.com/PostHog/charts-clickhouse/pull/184)) as its functionalities are now executed by the `workers` deployment.

As result, we have deprecated the following Helm values:

-   `beat.replicacount`
-   `beat.resources`
-   `beat.nodeSelector`
-   `beat.tolerations`
-   `beat.affinity`

If you didn’t make any customization to those, there’s nothing you need to do. Otherwise, please rename your customized values to be in the `workers.` scope.

### 7.0.0

This version upgrades the Helm dependency chart [`jetstack/cert-manager`](https://github.com/jetstack/cert-manager) from version `1.2.0` to `1.6.1`. This brings some updates to the custom resource definition (CRD).

If you **are not** overriding `cert-manager.installCRDs` by setting it to `false` **there’s nothing you need to do**. You can go on updating your Helm release as usual and enjoy your day!

If otherwise you are manually managing the `cert-manager`‘s CRDs, please remember to update the definitions in order to keep everything in sync.

### 6.0.0

This version upgrades the [`altinity/clickhouse-operator`](https://github.com/Altinity/clickhouse-operator) version to `0.16.1`. This brings some updates to the custom resource definition (CRD). In order to keep everything in sync, please run the following steps before updating your Helm release:

1. Download and extract the Helm chart release source code

    ```
    mkdir -p posthog-crd-upgrade
    wget -qO- https://github.com/PostHog/charts-clickhouse/archive/refs/tags/posthog-6.0.0.tar.gz | tar xvz - --strip 1 -C posthog-crd-upgrade
    ```

1. Update the `altinity/clickhouse-operator` CRDs by running:

    ```
    kubectl apply \
        -f posthog-crd-upgrade/charts/posthog/crds/clickhouseinstallations.clickhouse.altinity.com.yaml \
        -f posthog-crd-upgrade/charts/posthog/crds/clickhouseinstallationtemplates.clickhouse.altinity.com.yaml \
        -f posthog-crd-upgrade/charts/posthog/crds/clickhouseoperatorconfigurations.clickhouse.altinity.com.yaml
    ```

    Note: you'll likely see a warning like:

    ```
    Warning: resource customresourcedefinitions/clickhouseinstallations.clickhouse.altinity.com is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
    customresourcedefinition.apiextensions.k8s.io/clickhouseinstallations.clickhouse.altinity.com configured

    Warning: resource customresourcedefinitions/clickhouseinstallationtemplates.clickhouse.altinity.com is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
    customresourcedefinition.apiextensions.k8s.io/clickhouseinstallationtemplates.clickhouse.altinity.com configured

    Warning: resource customresourcedefinitions/clickhouseoperatorconfigurations.clickhouse.altinity.com is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically.
    customresourcedefinition.apiextensions.k8s.io/clickhouseoperatorconfigurations.clickhouse.altinity.com configured
    ```

    but this is safe to be ignored.

1. You can now move on with the Helm update as usual:
    ```
    helm repo update posthog
    helm upgrade --install -f ...
    ```
    Note: the ClickHouse pod will not be restarted but the `clickhouse-operator` will, no downtime is expected as part of this release.

### 5.0.0

This version changes defaults for Kafka PVC size and log retention policy. If your upgrade fails with the following:

```
Error: UPGRADE FAILED: cannot patch "posthog-posthog-kafka" with kind StatefulSet: StatefulSet.apps "posthog-posthog-kafka" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', and 'updateStrategy' are forbidden
```

There are two options:

1. Change your values to match to what the Kafka values were before (`size: 5Gi` and `logRetentionBytes: _4_000_000_000`)
2. Resize the PVC (Persistent Volume Claim) used by Kafka following our runbook [kafka-resize-disk](/docs/runbook/services/kafka/resize-disk)

### 4.0.0

This version introduces a [breaking change](https://github.com/PostHog/charts-clickhouse/pull/156) related to how `cert-manager` CRDs resources are deployed.

1. we renamed the `certManager.enabled` variable to `cert-manager.enabled`
2. we introduced a new variable called `cert-manager.installCRDs`. `cert-manager` requires a number of CRD resources to work.

    - to automatically install and manage them as part of your Helm release, simply leave the new `cert-manager.installCRDs` variable set to `true`
    - to manually install and manage them, simply set the new `cert-manager.installCRDs` variable to `false`

### 3.0.0

This version changes the way ZK is run in the chart. ZK has been spun out and is now a cluster being used for Kafka and ClickHouse. An unfortunate side effect of that is that Kafka StatefulSet must be deleted. The reason for this is because Kafka records the cluster ID in ZooKeeper and when you swap it out it complains that the cluster ID has changed and refuses to start. Note that when you delete the Kafka StatefulSet and pod you might lose some events that were in Kafka, but not yet in ClickHouse.

The error you will see from Kafka pod while upgrading:

```
  [2021-07-23 14:24:27,143] ERROR Fatal error during KafkaServer startup. Prepare to shutdown (kafka.server.KafkaServer)
kafka.common.InconsistentClusterIdException: The Cluster ID TYP8xsIWRFWkzSYmO_YWEA doesn't match stored clusterId Some(CizxEcefTou4Ehu65rmpuA) in meta.properties. The broker is trying to join the wrong cluster. Configured zookeeper.connect may be wrong.
```

How to fix?

-   Delete Kafka and Zookeeper StatefulSet `kubectl -n posthog delete sts posthog-posthog-kafka posthog-zookeeper`
-   Delete kafka persistent volume claim `kubectl -n posthog delete pvc data-posthog-posthog-kafka-0`
-   Wait for Kafka and Zookeeper pods to spin down (deleting sts in step 1 will also trigger the pods deletion)
-   Upgrade helm chart `helm upgrade -f values.yaml --timeout 30m --namespace posthog posthog posthog/posthog`

### 2.0.0

This version updated Redis chart in an incompatible way. If your upgrade fails with the following:

```
Upgrade "posthog" failed: cannot patch "posthog-posthog-redis-master" with kind StatefulSet: StatefulSet.apps "posthog-posthog-redis-master" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', and 'updateStrategy' are forbidden
```

Run `kubectl delete --namespace NAMESPACE sts posthog-posthog-redis-master` and `helm upgrade` again.
