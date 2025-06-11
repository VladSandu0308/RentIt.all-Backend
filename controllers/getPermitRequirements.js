const {validationResult} = require('express-validator');

exports.getPermitRequirements = async(req, res, next) => {
    console.log("Enter get permit requirements");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { address, mode } = req.body;
        
        // Determină regiunea din adresă
        const region = determineRegion(address);
        
        // Permise de bază pentru toate locațiile
        let requiredPermits = ['businessLicense'];
        
        // Adaugă permise specifice pentru închiriere
        if (mode === 'Rent') {
            requiredPermits.push('shortTermRental');
        }
        
        // Adaugă permise specifice regiunii
        const regionSpecificPermits = getRegionSpecificPermits(region);
        requiredPermits = [...requiredPermits, ...regionSpecificPermits];
        
        // Linkuri guvernamentale relevante
        const governmentLinks = getGovernmentLinks(region);
        
        return res.status(200).json({
            message: "Permit requirements retrieved successfully",
            region: region,
            requiredPermits: requiredPermits,
            governmentLinks: governmentLinks,
            processingTime: "15-30 zile lucrătoare"
        });

    } catch(err) {
        console.error('Error fetching permit requirements:', err);
        next(err);
    }
};

function determineRegion(address) {
    if (!address) return 'Localitate Rurală';
    
    const lowerAddress = address.toLowerCase();
    
    // Zone montane
    if (lowerAddress.includes('sinaia') || lowerAddress.includes('busteni') || 
        lowerAddress.includes('predeal') || lowerAddress.includes('bran')) {
        return 'Zona Montană';
    }
    
    // Delta Dunării
    if (lowerAddress.includes('tulcea') || lowerAddress.includes('delta') || 
        lowerAddress.includes('sulina')) {
        return 'Delta Dunării';
    }
    
    // Zone culturale (Maramureș, Bucovina)
    if (lowerAddress.includes('maramures') || lowerAddress.includes('bucovina') || 
        lowerAddress.includes('sapanta') || lowerAddress.includes('barsana') ||
        lowerAddress.includes('suceava') || lowerAddress.includes('moldovita')) {
        return 'Zona Culturală';
    }
    
    // Zone rurale
    return 'Localitate Rurală';
}

function getRegionSpecificPermits(region) {
    const regionPermits = {
        'Zona Montană': ['mountainTourism'],
        'Delta Dunării': ['ecotourism'],
        'Zona Culturală': ['culturalHeritage'], 
        'Localitate Rurală': ['ruralTourism']
    };
    
    return regionPermits[region] || ['ruralTourism'];
}

function getGovernmentLinks(region) {
    const links = {
        'Zona Montană': [
            {
                title: "Salvamont România",
                url: "https://salvamont.org/",
                description: "Avize pentru turism montan"
            },
            {
                title: "Primăria locală",
                url: "#",
                description: "Autorizații locale de turism"
            }
        ],
        'Delta Dunării': [
            {
                title: "ARBDD - Administrația Rezervației Delta Dunării",
                url: "https://www.ddbra.ro/",
                description: "Autorizații pentru turism ecologic"
            }
        ],
        'Zona Culturală': [
            {
                title: "Consiliul Județean",
                url: "#",
                description: "Autorizații pentru turism cultural"
            },
            {
                title: "Ministerul Culturii",
                url: "https://www.cultura.ro/",
                description: "Avize pentru zone de patrimoniu"
            }
        ],
        'Localitate Rurală': [
            {
                title: "ANTREC - Turism Rural",
                url: "https://www.antrec.ro/",
                description: "Certificare turism rural"
            },
            {
                title: "MADR - Programul LEADER",
                url: "https://www.madr.ro/",
                description: "Finanțări pentru turism rural"
            }
        ]
    };
    
    return links[region] || links['Localitate Rurală'];
}