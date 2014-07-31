#!/usr/bin/env bash
. dump.sh
mysql -umbzdev -pmbzDEV mbzdev < mbzprod.sql
rm mbzprod.sql
