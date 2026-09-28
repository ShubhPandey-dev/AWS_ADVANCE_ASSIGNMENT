const { v4: uuidv4 } = require("uuid");
const db = require("../config/dbConnect");

const createDocument = async ({
  userId,
  originalName,
  s3Key,
  s3Url,
  fileSize,
  mimeType,
}) => {
  const id = uuidv4();

  const query = `
    INSERT INTO documents
    (
      id,
      user_id,
      original_name,
      s3_key,
      s3_url,
      file_size,
      mime_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id,
    userId,
    originalName,
    s3Key,
    s3Url,
    fileSize,
    mimeType,
  ];

  const result = await db.execute(query, values);

  return id;
};
const getDocumentsByUserId = async (userId) => {
  const query = `
    SELECT
      id,
      user_id,
      original_name,
      s3_key,
      s3_url,
      file_size,
      mime_type,
      uploaded_at
    FROM documents
    WHERE user_id = ?
    ORDER BY uploaded_at DESC
  `;

  const [rows] = await db.execute(query, [userId]);

  return rows;
};

const getDocumentById = async (id) => {
  const query = `
    SELECT
      id,
      user_id,
      original_name,
      s3_key,
      s3_url,
      file_size,
      mime_type,
      uploaded_at
    FROM documents
    WHERE id = ?
  `;

  const [rows] = await db.execute(query, [id]);

  return rows[0] || null;
};

const deleteDocumentById = async (id) => {
  const query = `
    DELETE FROM documents
    WHERE id = ?
  `;

  const [result] = await db.execute(query, [id]);

  return result;
};

module.exports = {
  createDocument,
  getDocumentsByUserId,
  getDocumentById,
  deleteDocumentById
};