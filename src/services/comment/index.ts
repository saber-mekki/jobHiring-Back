import { executeSQLQuery } from "../../database";

export const getComment = async (commentBlogId?: number) => {
    let query;
    
    if (!commentBlogId) {
        query = 'SELECT * FROM public."commentTable";';
    } else {
        query = `SELECT * FROM public."commentTable" WHERE "commentBlogId" = '${commentBlogId}';`;
    }

    const result = await executeSQLQuery(query);
    return result.rows;
};

export const addComment = async (
    commentAuthor: string,
    commentBlogId: number,
    commentDate: string,
    commentContent: string,
    commentAuthorImage:string | null

) => {
    const query = `INSERT INTO public."commentTable" 
                   ("commentAuthor", "commentBlogId", "commentDate", "commentContent","commentAuthorImage") 
                   VALUES ('${commentAuthor}', '${commentBlogId}', '${commentDate}', '${commentContent}', '${commentAuthorImage}') 
                   RETURNING *;`;

    const result = await executeSQLQuery(query);
    return result.rows[0];
};

export const deleteComment = async (commentId: number) => {
    const query = `DELETE FROM public."commentTable" 
                   WHERE "commentId" = '${commentId}' 
                   RETURNING "commentId";`;

    const result = await executeSQLQuery(query);
    return result.rows[0];
};

export const updateComment = async (
    commentId: number,
    commentAuthor: string,
    commentDate: string,
    commentContent: string,
    commentAuthorImage : string | null
) => {
    const query = `UPDATE public."commentTable"
                   SET "commentAuthor" = '${commentAuthor}', 
                       "commentDate" = '${commentDate}',
                       "commentContent" = '${commentContent}',
                       "commentAuthorImage"= '${commentAuthorImage}'
                   WHERE "commentId" = '${commentId}' 
                   RETURNING *;`;

    const result = await executeSQLQuery(query);
    return result.rows[0];
};
