class ApiFeature {
    constructor(query, queryParams,params, user = null){
        this.query = query;
        this.queryParams = queryParams;
        this.params = params;
        this.user = user;
    }

    filter(refField){
        let filterObject = {};
        // Check if refrence field is exist
        if (
        refField &&
        this.query.model.schema.path(refField) &&
        this.query.model.schema.path(refField).options.ref 
        ){
            const paramId = this.params.playerId 
            || this.params.id;

            if(paramId){
                filterObject = {[refField]: paramId}
            } else if (this.user&& this.user.role !== "admin") {
                // ✅ حالة الكوتش - id من الـ logged-in user
                filterObject = { [refField]: this.user._id };
            }
        }
        
        const queryStrObj = {...this.queryParams };
        const excludes = ['page', 'limit', 'sort', 'fields', 'keyword'];
        excludes.forEach((field)=> delete queryStrObj[field]);

        
        const finalFilter = this.getFinalFilterQuery(filterObject, queryStrObj);

        //Build query
        this.query = this.query.find(finalFilter)
        return this;
    }
    

    // convert  field[gte]=value to {field: {$gte: value}}  (filterMethode)
    getFinalFilterQuery =(filterObject,queryObj) => {
        const finalFilterQuery = {};
        for(const key in queryObj){
            const value = queryObj[key]
            const match = key.match(/^(.*)\[(gte|gt|lte|lt)\]$/);

            if(match){
                const feildName = match[1];
                const operator = `$${match[2]}`;

                if(!finalFilterQuery[feildName]){
                    finalFilterQuery[feildName] = {};
                }
                finalFilterQuery[feildName][operator] = value;
            }else{
                finalFilterQuery[key] = value;
            }
        }
        const filtring = {...filterObject, ...finalFilterQuery};
        return filtring;
    }

    sort(){
        if(this.queryParams.sort){
            const sortBy = this.queryParams.sort.split(',').join(" ");
            this.query = this.query.sort(sortBy)
            
        }
        return this;
    }
    limitFields(){
        if(this.queryParams.fields){
            const fields = this.queryParams.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    search(fields = []) {
        if (!this.queryParams.keyword || !fields.length) {
            return this;
        }
        const keyword = this.queryParams.keyword.trim();
        const regexSearch = {
            $or: fields.map(field => ({
                [field]: {
                    $regex: keyword,
                    $options: "i"
                }
            }))
        };
        if (fields.includes("name")) {
            this.query = this.query.find({
                $or: [
                    {
                        $text: {
                            $search: keyword
                        }
                    },
                    ...regexSearch.$or.filter(
                        field => !("name" in field)
                    )
                ]
            });
        } else {
            this.query = this.query.find(regexSearch);
        }
        return this;
    }
    paginate(countDocoments) {
        const page = +this.queryParams.page || 1;
        const limit = +this.queryParams.limit || 50;
        const skip = (page -1) * limit;
        const endIndex = page * limit;

        const pagination = {};
        pagination.currentPage= page;
        pagination.limit = limit;
        pagination.numberOfPages = Math.ceil(countDocoments / limit)

        if(endIndex < countDocoments){
            pagination.next = page + 1;
        } 
        if(skip > 0) {
            pagination.prev = page - 1;
        }

        this.query = this.query.skip(skip).limit(limit);
        this.pagination = pagination;

        return this
    }
}


export default ApiFeature