#!/usr/bin/env python3
"""
n8n Workflow Patch Script - Comment Sync Fix
Updates Node 11 (Format Evidence Comment) and Node 15 (Format Final Result) JS code
in the n8n SQLite database directly.
"""

import sqlite3
import json
import sys
import os
from datetime import datetime

DB_PATH = "/opt/dev-fabric/n8n/data/.n8n/database.sqlite"
WORKFLOW_ID = "Sv12QTo56NoPUu2D"
PATCH_FILE = "/tmp/patch-config.json"

# Load patch configuration
with open(PATCH_FILE, "r") as f:
    patch_config = json.load(f)

# Build a lookup for new JS code by node ID
new_code = {}
for node_patch in patch_config["updateNodes"]:
    new_code[node_patch["id"]] = {
        "jsCode": node_patch["newJsCode"],
        "name": node_patch["name"],
    }

# Connect to database
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get current workflow
cursor.execute(
    "SELECT id, name, active, nodes, versionId, updatedAt FROM workflow_entity WHERE id = ?",
    (WORKFLOW_ID,),
)
row = cursor.fetchone()

if not row:
    print(f"ERROR: Workflow {WORKFLOW_ID} not found in database!")
    sys.exit(1)

workflow = dict(row)
nodes_json_str = workflow["nodes"]

# The 'nodes' column is a JSON string of the nodes array
try:
    nodes = json.loads(nodes_json_str)
except json.JSONDecodeError as e:
    print(f"ERROR: Failed to parse nodes JSON: {e}")
    sys.exit(1)

print(f"Workflow: {workflow['name']}")
print(f"Active: {workflow['active']}")
print(f"Node count: {len(nodes)}")
print(f"Current updatedAt: {workflow['updatedAt']}")

# Update nodes
updated_count = 0
for node in nodes:
    node_id = node.get("id", "")
    if node_id in new_code:
        old_code_len = len(node["parameters"].get("jsCode", ""))
        node["parameters"]["jsCode"] = new_code[node_id]["jsCode"]
        new_code_len = len(new_code[node_id]["jsCode"])
        print(f"\nUPDATED Node: '{new_code[node_id]['name']}' (id={node_id})")
        print(f"  Old JS code length: {old_code_len}")
        print(f"  New JS code length: {new_code_len}")
        updated_count += 1

if updated_count == 0:
    print("WARNING: No nodes were updated! Check node IDs.")
    # Show available node IDs for debugging
    print("Available node IDs:")
    for node in nodes:
        print(f"  {node['id']} -> '{node['name']}'")
    sys.exit(1)

# Check no other nodes were changed
print(f"\nNodes updated: {updated_count}")
print(f"Total nodes: {len(nodes)} (unchanged)")

# Serialize nodes back to JSON
new_nodes_json = json.dumps(nodes, ensure_ascii=False)

# Update the database
new_updated_at = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")

cursor.execute(
    "UPDATE workflow_entity SET nodes = ?, updatedAt = ? WHERE id = ?",
    (new_nodes_json, new_updated_at, WORKFLOW_ID),
)
conn.commit()

print(f"\nDatabase updated!")
print(f"  New updatedAt: {new_updated_at}")
print(f"  Nodes JSON length: {len(new_nodes_json)} chars")

# Verify the update
cursor.execute(
    "SELECT nodes, updatedAt FROM workflow_entity WHERE id = ?", (WORKFLOW_ID,)
)
verify_row = cursor.fetchone()
verify_nodes = json.loads(verify_row["nodes"])
verify_ok = True
for node in verify_nodes:
    if node["id"] in new_code:
        if node["parameters"].get("jsCode") == new_code[node["id"]]["jsCode"]:
            print(f"VERIFIED: Node '{node['name']}' updated successfully")
        else:
            print(f"VERIFY FAILED: Node '{node['name']}' code mismatch!")
            verify_ok = False

conn.close()

if verify_ok:
    print("\n=== PATCH APPLIED SUCCESSFULLY ===")
else:
    print("\n=== PATCH VERIFICATION FAILED ===")
    sys.exit(1)
