import { sql } from "@vercel/postgres";

export async function isAdmin(fid: string) {
  const result = await sql`
    SELECT EXISTS(SELECT 1 FROM admin_fids WHERE fid = ${fid})
  `;
  return result.rows[0].exists;
}

export async function createPostApproval(
  postHash: string,
  title: string,
  description: string,
  postType: string,
  requestedFunding: number,
  authorFid: string,
  gistUrl: string,
) {
  return await sql`
    INSERT INTO posts_approval (post_hash, title, description, post_type, requested_funding, author_fid, gist_url)
    VALUES (${postHash}, ${title}, ${description}, ${postType}, ${requestedFunding}, ${authorFid}, ${gistUrl})
    RETURNING *
  `;
}

export async function approvePost(postHash: string, approverFid: string) {
  return await sql`
    UPDATE posts_approval
    SET status = 'approved',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = ${approverFid}
    WHERE post_hash = ${postHash}
    RETURNING *
  `;
}

export async function rejectPost(postHash: string, approverFid: string) {
  return await sql`
    UPDATE posts_approval
    SET status = 'rejected',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = ${approverFid}
    WHERE post_hash = ${postHash}
    RETURNING *
  `;
}

export async function getPendingPosts() {
  return await sql`
    SELECT * FROM posts_approval
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `;
}

export async function getApprovedPosts() {
  return await sql`
    SELECT * FROM posts_approval
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;
}
