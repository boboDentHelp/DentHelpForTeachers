# Database Backup & Restore Guide

## Viewing Backups

### List all backups
```powershell
kubectl exec -it deployment/mysql -n dentalhelp -- ls -lh /backup/
```

### View backup manifest
```powershell
kubectl exec -it deployment/mysql -n dentalhelp -- cat /backup/20251129-020000/manifest.txt
```

### Check backup size
```powershell
kubectl exec -it deployment/mysql -n dentalhelp -- du -sh /backup/*
```

---

## Manual Backup (On-Demand)

### Create manual backup
```powershell
# Create backup job
kubectl create -f 02-manual-backup-job.yaml

# Watch progress
kubectl logs -f job/mysql-backup-manual -n dentalhelp

# Check if succeeded
kubectl get jobs -n dentalhelp
```

### Delete manual backup job (after completion)
```powershell
kubectl delete job mysql-backup-manual -n dentalhelp
```

---

## Restoring from Backup

### Option 1: Restore specific database

```powershell
# Find backup date
kubectl exec -it deployment/mysql -n dentalhelp -- ls -lh /backup/

# Restore auth_db from backup
kubectl exec -it deployment/mysql -n dentalhelp -- bash -c '
  gunzip -c /backup/20251129-020000/auth_db.sql.gz | \
  mysql -u root -p$MYSQL_ROOT_PASSWORD auth_db
'

# Verify restoration
kubectl exec -it deployment/mysql -n dentalhelp -- \
  mysql -u root -p$MYSQL_ROOT_PASSWORD -e "USE auth_db; SHOW TABLES;"
```

### Option 2: Restore all databases

```powershell
# Restore all databases from specific backup
kubectl exec -it deployment/mysql -n dentalhelp -- bash -c '
  BACKUP_DATE=20251129-020000

  for db_file in /backup/$BACKUP_DATE/*.sql.gz; do
    db_name=$(basename $db_file .sql.gz)
    echo "Restoring $db_name..."

    gunzip -c $db_file | mysql -u root -p$MYSQL_ROOT_PASSWORD $db_name

    if [ $? -eq 0 ]; then
      echo "✓ $db_name restored successfully"
    else
      echo "✗ Failed to restore $db_name"
    fi
  done
'
```

### Option 3: Disaster recovery (complete restore)

```powershell
# 1. Drop all databases (DANGEROUS!)
kubectl exec -it deployment/mysql -n dentalhelp -- bash -c '
  mysql -u root -p$MYSQL_ROOT_PASSWORD <<EOF
  DROP DATABASE IF EXISTS auth_db;
  DROP DATABASE IF EXISTS patient_db;
  DROP DATABASE IF EXISTS appointment_db;
  DROP DATABASE IF EXISTS dental_records_db;
  DROP DATABASE IF EXISTS xray_db;
  DROP DATABASE IF EXISTS treatment_db;
  DROP DATABASE IF EXISTS notification_db;
EOF
'

# 2. Recreate databases
kubectl exec -it deployment/mysql -n dentalhelp -- bash -c '
  mysql -u root -p$MYSQL_ROOT_PASSWORD <<EOF
  CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE patient_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE appointment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE dental_records_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE xray_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE treatment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE DATABASE notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
'

# 3. Restore from backup
kubectl exec -it deployment/mysql -n dentalhelp -- bash -c '
  BACKUP_DATE=20251129-020000

  for db_file in /backup/$BACKUP_DATE/*.sql.gz; do
    db_name=$(basename $db_file .sql.gz)
    echo "Restoring $db_name..."
    gunzip -c $db_file | mysql -u root -p$MYSQL_ROOT_PASSWORD $db_name
  done
'

# 4. Verify
kubectl exec -it deployment/mysql -n dentalhelp -- \
  mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SHOW DATABASES;"
```

---

## Download Backup to Local Machine

```powershell
# Copy backup from pod to local machine
$POD_NAME = kubectl get pod -n dentalhelp -l app=mysql -o jsonpath='{.items[0].metadata.name}'

kubectl cp dentalhelp/$POD_NAME:/backup/20251129-020000 ./backups/

# Backups now in ./backups/ folder
```

---

## Backup to Google Cloud Storage (Optional)

### Setup (one-time)

```powershell
# Create Cloud Storage bucket
gsutil mb gs://dentalhelp-backups

# Set lifecycle (delete after 30 days)
gsutil lifecycle set bucket-lifecycle.json gs://dentalhelp-backups
```

### Modify CronJob to upload to GCS

Add to backup script (after gzip):
```bash
# Upload to Cloud Storage
gsutil -m cp -r $BACKUP_DIR gs://dentalhelp-backups/
```

---

## Monitoring Backups

### Check CronJob status
```powershell
kubectl get cronjob -n dentalhelp
```

### View CronJob history
```powershell
kubectl get jobs -n dentalhelp | grep mysql-backup
```

### Check last backup logs
```powershell
# Get latest backup job
$JOB_NAME = kubectl get jobs -n dentalhelp --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}'

# View logs
kubectl logs job/$JOB_NAME -n dentalhelp
```

### Manual trigger (for testing)
```powershell
# Trigger CronJob manually
kubectl create job --from=cronjob/mysql-backup mysql-backup-test -n dentalhelp

# Watch logs
kubectl logs -f job/mysql-backup-test -n dentalhelp
```

---

## Troubleshooting

### Backup job fails

```powershell
# Check job status
kubectl describe job mysql-backup-xxxxx -n dentalhelp

# Check pod logs
kubectl logs job/mysql-backup-xxxxx -n dentalhelp

# Common issues:
# 1. Wrong MySQL password - check mysql-secret
# 2. Insufficient storage - check PVC size
# 3. Database doesn't exist - normal for new deployments
```

### No backups created

```powershell
# Check CronJob is active
kubectl get cronjob mysql-backup -n dentalhelp

# Check schedule
kubectl describe cronjob mysql-backup -n dentalhelp

# Manually trigger to test
kubectl create job --from=cronjob/mysql-backup test-backup -n dentalhelp
```

### Restore fails

```powershell
# Check backup file exists
kubectl exec -it deployment/mysql -n dentalhelp -- ls -lh /backup/

# Check database exists
kubectl exec -it deployment/mysql -n dentalhelp -- \
  mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SHOW DATABASES;"

# Check backup file integrity
kubectl exec -it deployment/mysql -n dentalhelp -- \
  gunzip -t /backup/20251129-020000/auth_db.sql.gz
```

---

## Best Practices

1. **Test restores regularly** - Backups are useless if you can't restore
2. **Download critical backups** - Keep local copies
3. **Monitor backup jobs** - Set up alerts for failures
4. **Verify backup size** - Make sure databases are actually backed up
5. **Document recovery procedures** - Practice disaster recovery

---

## Backup Schedule

- **Frequency:** Daily at 2 AM UTC
- **Retention:** 7 days (168 hours)
- **Storage:** 10GB persistent volume
- **Compression:** gzip (reduces size by ~70%)
- **Format:** SQL dumps (human-readable, portable)

---

## Cost

- **PVC (10GB):** ~$0.17/month (GKE standard disk)
- **CronJob:** FREE (uses existing cluster resources)
- **Total:** ~$0.17/month

Optional Cloud Storage: ~$0.20/GB/month (~$2/month for 10GB)
