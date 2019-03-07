exports.parseMessage = (source) => {
    return source
        .map((m) => {
            if(m.eid && m.eid != -1)
                m.date = new Date(m.eid / 1000)
            //console.log(m)
            return m;
        })
};