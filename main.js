Parse.Cloud.define("createPoi", async(request) => {
    const user = request.user;
    if (user === undefined)
        return { code: 403, error: "Unauthorized user" };

    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first({ useMasterKey: true });
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    const pois = region.relation("pois");
    const queryPoi = pois.query();
    queryPoi.equalTo('url', request.params.poi);
    const existingPoi = await queryPoi.first({ useMasterKey: true });
    if (existingPoi !== undefined)
        return { code: 500, error: "PoI already exists" };

    const PoI = Parse.Object.extend("PoI");
    const poi = new PoI();

    poi.set("url", request.params.poi)
    poi.set("website", "");
    poi.set("address", "");
    poi.set("iframeUrl", "");
    poi.set("name", request.params.name);
    poi.set("phone", "");
    poi.set("description", "");
    poi.set("comments", []);
    poi.set("images", []);
    poi.set("type", request.params.type);
    poi.set("mail", "");
    await poi.save(null, { useMasterKey: true });

    pois.add(poi);
    await region.save(null, { useMasterKey: true });

    return { code: 200 };
});

Parse.Cloud.define("getPoi", async(request) => {
    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first();
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    const pois = region.relation("pois");
    const queryPoi = pois.query();
    queryPoi.equalTo('url', request.params.poi);
    const existingPoi = await queryPoi.first();
    if (existingPoi === undefined)
        return { code: 404, error: "PoI not found" };

    return {
        code: 200,
        poi: {
            website: existingPoi.get("website"),
            address: existingPoi.get("address"),
            iframeUrl: existingPoi.get("iframeUrl"),
            name: existingPoi.get("name"),
            phone: existingPoi.get("phone"),
            description: existingPoi.get("description"),
            comments: existingPoi.get("comments"),
            images: existingPoi.get("images"),
            type: existingPoi.get("type"),
            mail: existingPoi.get("mail"),
            parentName: region.get("name")
        }
    }
});

Parse.Cloud.define("updatePoi", async(request) => {
    const user = request.user;
    if (user === undefined)
        return { code: 403, error: "Unauthorized user" };

    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first({ useMasterKey: true });
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    const pois = region.relation("pois");
    const queryPoi = pois.query();
    queryPoi.equalTo('url', request.params.poi);
    const existingPoi = await queryPoi.first({ useMasterKey: true });
    if (existingPoi === undefined)
        return { code: 404, error: "PoI not found" };

    await existingPoi.save(request.params.data, { useMasterKey: true });
    await region.save(null, { useMasterKey: true });
    return { code: 200 };
});

Parse.Cloud.define("deletePoi", async(request) => {
    const user = request.user;
    if (user === undefined)
        return { code: 403, error: "Unauthorized user" };

    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first({ useMasterKey: true });
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    const pois = region.relation("pois");
    const queryPoi = pois.query();
    queryPoi.equalTo('url', request.params.poi);
    const existingPoi = await queryPoi.first({ useMasterKey: true });
    if (existingPoi === undefined)
        return { code: 404, error: "PoI not found" };

    pois.remove(existingPoi);
    await existingPoi.destroy({ useMasterKey: true });
    await region.save(null, { useMasterKey: true });
    return { code: 200 };
});

Parse.Cloud.define("getRegion", async(request) => {
    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first();
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    let response = {
        name: region.get("name"),
        description: region.get("description"),
        images: region.get("images"),
        generalTabs: region.get("generalTabs")
    };
    let restaurants = [];
    let hotels = [];
    let activities = [];
    const queryPois = region.relation("pois").query();
    const allPois = await queryPois.find();

    for (let i = 0; i < allPois.length; i++) {
        const shortPoi = {
            nextUrl: allPois[i].get("url"),
            name: allPois[i].get("name"),
            address: allPois[i].get("address")
        };
        if (allPois[i].get("images").length > 0)
            shortPoi.image = allPois[i].get("images")[0];
        if (allPois[i].get("comments").length > 0)
            shortPoi.rate = allPois[i].get("comments")[0].rate;
        if (allPois[i].get("type") == "restaurant")
            restaurants.push(shortPoi);
        if (allPois[i].get("type") == "hotel")
            hotels.push(shortPoi);
        if (allPois[i].get("type") == "activity")
            activities.push(shortPoi);
    }
    if (activities.length > 0)
        response.activities = activities;
    if (hotels.length > 0)
        response.hotels = hotels;
    if (restaurants.length > 0)
        response.restaurants = restaurants;
    return { code: 200, response: response };
});

Parse.Cloud.define("updateRegion", async(request) => {
    const user = request.user;
    if (user === undefined)
        return { code: 403, error: "Unauthorized user" };

    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first({ useMasterKey: true });
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    await region.save(request.params.data, { useMasterKey: true });
    return { code: 200 };
});