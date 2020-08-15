Parse.Cloud.define("createPoi", async(request) => {
    const query = new Parse.Query("Region");
    query.equalTo('url', request.params.region);
    const region = await query.first();
    if (region === undefined)
        return { code: 404, error: "Region not found" };

    const pois = region.relation("pois");
    const queryPoi = pois.query();
    queryPoi.equalTo('url', request.params.poi);
    const existingPoi = await queryPoi.first();
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
    await poi.save();

    pois.add(poi);
    await region.save();

    return { code: 200 };
});