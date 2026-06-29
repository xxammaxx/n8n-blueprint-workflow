#!/usr/bin/env python3
"""
Update workflow_history.nodes with the patched code.
The execution engine uses workflow_history.activeVersionId, not workflow_entity.nodes.
"""

import sqlite3
import json

DB_PATH = "/opt/dev-fabric/n8n/data/.n8n/database.sqlite"
WORKFLOW_ID = "Sv12QTo56NoPUu2D"

# Get the active version
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get workflow_entity to find activeVersionId
cursor.execute(
    "SELECT versionId, activeVersionId, nodes FROM workflow_entity WHERE id = ?",
    (WORKFLOW_ID,),
)
wf = cursor.fetchone()
print(f"workflow_entity.versionId: {wf['versionId']}")
print(f"workflow_entity.activeVersionId: {wf['activeVersionId']}")
active_version_id = wf["activeVersionId"]

# Get current workflow_entity nodes (patched)
current_nodes = json.loads(wf["nodes"])
print(f"workflow_entity.nodes length: {len(json.dumps(current_nodes))} chars")

# Get workflow_history entry
cursor.execute(
    "SELECT versionId, nodes, name, updatedAt FROM workflow_history WHERE versionId = ?",
    (active_version_id,),
)
history = cursor.fetchone()
history_nodes = json.loads(history["nodes"])
print(f"workflow_history.nodes length: {len(json.dumps(history_nodes))} chars")
print(f"workflow_history.updatedAt: {history['updatedAt']}")

# Check if history already has patched code
history_node11 = next(
    (n for n in history_nodes if n["id"] == "25d2cbd3-b919-4f19-9f41-5aac51841742"),
    None,
)
if history_node11 and "SYNCED from Runner status.json" in history_node11[
    "parameters"
].get("jsCode", ""):
    print("workflow_history ALREADY has patched code - no update needed")
    conn.close()
    exit(0)

# Find patched nodes from workflow_entity
current_node11 = next(
    (n for n in current_nodes if n["id"] == "25d2cbd3-b919-4f19-9f41-5aac51841742"),
    None,
)
current_node15 = next(
    (n for n in current_nodes if n["id"] == "f1aedb55-8b84-4886-85be-8a672817add5"),
    None,
)

if not current_node11 or not current_node15:
    print("ERROR: Could not find patched nodes in workflow_entity")
    conn.close()
    exit(1)

# Update history nodes
updated = 0
for node in history_nodes:
    if node["id"] == "25d2cbd3-b919-4f19-9f41-5aac51841742":
        old_len = len(node["parameters"].get("jsCode", ""))
        node["parameters"]["jsCode"] = current_node11["parameters"]["jsCode"]
        new_len = len(current_node11["parameters"]["jsCode"])
        print(
            f"Updated Node 11 (Format Evidence Comment): {old_len} -> {new_len} chars"
        )
        updated += 1
    elif node["id"] == "f1aedb55-8b84-4886-85be-8a672817add5":
        old_len = len(node["parameters"].get("jsCode", ""))
        node["parameters"]["jsCode"] = current_node15["parameters"]["jsCode"]
        new_len = len(current_node15["parameters"]["jsCode"])
        print(f"Updated Node 15 (Format Final Result): {old_len} -> {new_len} chars")
        updated += 1

if updated == 0:
    print("WARNING: No nodes matched in history!")
    conn.close()
    exit(1)

# Serialize and update
new_nodes_json = json.dumps(history_nodes, ensure_ascii=False)
print(f"New history nodes length: {len(new_nodes_json)} chars")

from datetime import datetime

new_updated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.000")

cursor.execute(
    "UPDATE workflow_history SET nodes = ?, updatedAt = ? WHERE versionId = ?",
    (new_nodes_json, new_updated_at, active_version_id),
)
conn.commit()

# Verify
cursor.execute(
    "SELECT length(nodes), updatedAt FROM workflow_history WHERE versionId = ?",
    (active_version_id,),
)
verify = cursor.fetchone()
print(f"VERIFIED: history nodes now {verify[0]} chars, updatedAt {verify[1]}")

conn.close()
print("\n=== WORKFLOW_HISTORY PATCH APPLIED ===")
