#!/usr/bin/env bash
ssh root@mbz-model bash dump.sh #TODO: 写一个 crontab 每天凌晨做这件事
scp root@mbz-model:mbzprod.sql mbzprod.sql
