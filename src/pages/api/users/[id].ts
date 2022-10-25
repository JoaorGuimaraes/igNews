import { NextApiRequest, NextApiResponse } from "next";


export default (request : NextApiRequest, response: NextApiResponse) => {

    const id = request.query.id;
    
    const users = [
        {id: 1, name: 'Diego'},
        {id: 1, name: 'Diego'},
        {id: 1, name: 'Diego'},
    ]

    return response.json(users);
}