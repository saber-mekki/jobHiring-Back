import { executeSQLQuery ,pool} from "../../database";
export const getComment = async (commentBlogId?: number, commentId?: number, userId?: number) => {
    const query = `
        WITH RECURSIVE CommentTree AS (
            SELECT 
                c."commentId",
                c."parent_comment_id",
                c."commentAuthor",
                c."commentContent",
                c."commentDate",
                c."commentAuthorImage",
                c."likes",
                c."userId",
                EXISTS(
                    SELECT 1 FROM public.user_likes 
                    WHERE user_id = $${userId ? 2 : 1}
                    AND comment_id = c."commentId"
                ) as has_liked,
                1 as depth
            FROM public."commentTable" c
            WHERE 
                c."parent_comment_id" IS NULL
                ${commentBlogId ? 'AND c."commentBlogId" = $1' : ''}
                ${commentId ? 'AND c."commentId" = $1' : ''}
            
            UNION ALL
            
            SELECT 
                c."commentId",
                c."parent_comment_id",
                c."commentAuthor",
                c."commentContent",
                c."commentDate",
                c."commentAuthorImage",
                c."likes",
                c."userId",
                EXISTS(
                    SELECT 1 FROM public.user_likes 
                    WHERE user_id = $${userId ? 2 : 1}
                    AND comment_id = c."commentId"
                ) as has_liked,
                ct.depth + 1
            FROM public."commentTable" c
            INNER JOIN CommentTree ct ON c."parent_comment_id" = ct."commentId"
        )
        SELECT * FROM CommentTree
        ORDER BY depth, "commentDate" DESC;
    `;

    const params = [];
    if (commentBlogId) params.push(commentBlogId);
    else if (commentId) params.push(commentId);
    if (userId) params.push(userId);

    const result = await executeSQLQuery(query, params);
    return result.rows;
};
export const addComment = async (
    userId:number,
    commentAuthor: string,
    commentBlogId: number,
    commentDate: string,
    commentContent: string,
    commentAuthorImage: string | null,
    parent_comment_id: number | null
) => {
    // Utiliser des paramètres préparés pour éviter les injections SQL
    const query = `
        INSERT INTO public."commentTable" 
        ("userId","commentAuthor", "commentBlogId", "commentDate", "commentContent", "commentAuthorImage", "parent_comment_id", "likes") 
        VALUES ($1, $2, $3, $4, $5, $6, $7,$8) 
        RETURNING *;
    `;
    
    const values = [
        userId,
        commentAuthor, 
        commentBlogId, 
        commentDate, 
        commentContent, 
        commentAuthorImage, 
        parent_comment_id,
        0 // Initialiser les likes à 0
    ];

    const result = await executeSQLQuery(query, values);
    return result.rows[0];
};

export const deleteComment = async (commentId: number) => {
    // D'abord, supprimer tous les commentaires enfants
    const deleteChildrenQuery = `
        DELETE FROM public."commentTable" 
        WHERE "parent_comment_id" = $1;
    `;
    
    await executeSQLQuery(deleteChildrenQuery, [commentId]);
    
    // Ensuite, supprimer le commentaire principal
    const query = `
        DELETE FROM public."commentTable" 
        WHERE "commentId" = $1 
        RETURNING "commentId";
    `;

    const result = await executeSQLQuery(query, [commentId]);
    return result.rows[0];
};

export const updateComment = async (
    commentId: number,
    commentAuthor: string,
    commentDate: string,
    commentContent: string,
    commentAuthorImage: string | null
) => {
    // Construire la requête de mise à jour
    let query = `
        UPDATE public."commentTable"
        SET "commentAuthor" = $1, 
            "commentDate" = $2,
            "commentContent" = $3
    `;
    
    // Tableau de paramètres pour la requête
    const queryParams: (string | number)[] = [commentAuthor, commentDate, commentContent];

if (commentAuthorImage !== null) {
    query += `, "commentAuthorImage" = $4`;
    queryParams.push(commentAuthorImage);
    query += ` WHERE "commentId" = $5 RETURNING *;`;
    queryParams.push(commentId);
} else {
    query += ` WHERE "commentId" = $4 RETURNING *;`;
    queryParams.push(commentId);
}


    const result = await executeSQLQuery(query, queryParams);
    return result.rows[0];
};

// services/comment/index.ts
// services/comment/index.ts

export const likeComment = async (commentId: number, userId: number) => {
    const client = await pool.connect(); // Utilisation directe du pool
    
    try {
        await client.query('BEGIN');
        
        const checkResult = await client.query(
            `SELECT * FROM public.user_likes WHERE user_id = $1 AND comment_id = $2`,
            [userId, commentId]
        );

        if (checkResult.rows.length > 0) {
            await client.query(
                `DELETE FROM public.user_likes WHERE user_id = $1 AND comment_id = $2`,
                [userId, commentId]
            );
            await client.query(
                `UPDATE public."commentTable" SET likes = GREATEST(likes - 1, 0) 
                WHERE "commentId" = $1`,
                [commentId]
            );
        } else {
            await client.query(
                `INSERT INTO public.user_likes (user_id, comment_id) VALUES ($1, $2)`,
                [userId, commentId]
            );
            await client.query(
                `UPDATE public."commentTable" SET likes = likes + 1 
                WHERE "commentId" = $1`,
                [commentId]
            );
        }

        const result = await client.query(
            `SELECT *, EXISTS(
                SELECT 1 FROM public.user_likes 
                WHERE user_id = $1 AND comment_id = $2
            ) as has_liked FROM public."commentTable" WHERE "commentId" = $2`,
            [userId, commentId]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release(); // Libération correcte du client
    }
};
// Fonction pour obtenir le nombre total de commentaires pour un blog
export const getCommentCount = async (blogId: number) => {
    const query = `
        SELECT COUNT(*) as comment_count 
        FROM public."commentTable" 
        WHERE "commentBlogId" = $1;
    `;
    
    const result = await executeSQLQuery(query, [blogId]);
    return result.rows[0].comment_count;
};
