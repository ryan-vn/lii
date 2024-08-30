import OSS from 'ali-oss';

const store = new OSS({
    region: 'oss-cn-shanghai',
    // stsToken: '<security-token>'
});

// export const professionsTypeArr = ['engineering', 'enchanting', 'alchemy', 'tailoring', 'leatherworking', 'blacksmithing', 'jewelcrafting', 'inscription', 'cooking'];

export const genFileName = ({
    server,
    side,
    professionType,
    start,
    end,
    time,
    userId,
    length
}) => {
    return `data/data-${professionType}-${side}-${server}-${start}-${end}-${userId}-${time}-${length}.json`;
};

const genFileByJson = (jsonStr) => {
    const blob = new Blob([jsonStr], { type: "application/json" });

    return blob;
};

export const uploadFile = (fileName, content) => {
    return store.put(fileName, genFileByJson(content));
};

export const getTargetProfessionData = async ({
    server,
    side,
    professionType,
}) => {

    // console.log(server, side, professionType);

    return store.list({
        prefix: `data/data-${professionType}-${side}-${server}-`
    });

};

export const getFileList = ({
    server,
    side,
    professionType
}) => {
    store.list({
        prefix: `data/data-${professionType}-${side}-${server}-`
    }).then((result) => {
        console.log('objects: %j', result.objects);

        // fetch(result.objects[0].url).then(res => res.json()).then((res) => {
        //     console.log(res);
        // });
    })
};

// store.list().then((result) => {
//     console.log('objects: %j', result.objects);
//     return store.put('my-obj', new OSS.Buffer('hello world'));
// }).then((result) => {
//     console.log('put result: %j', result);
//     return store.get('my-obj');
// }).then((result) => {
//     console.log('get result: %j', result.content.toString());
// });