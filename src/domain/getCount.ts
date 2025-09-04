import type { Servicio } from "@/model/service";
import { countServiceCodesByLocation, countServiceCodesTotal } from "./countServiceCodes";
import { countServiceTypesByLocation, countServiceTypesTotal } from "./countServiceTypes";
import { getTotalNumberOfUnitsInvolved, getTotalNumberOfUnitsInvolvedByLocation } from "./groupNumberOfUnitsInvolved";

interface GetCountParams {
    servicios: Servicio[]
    locations: string[]
    serviceCodes: string[]
    serviceTypes: string[]
}

interface Count {
    serviceCodesByLocation: {
        [localidad: string]: {
            [key: string]: number
        }
    },
    serviceCodesTotal: {
        [key: string]: number
    },
    serviceTypesByLocation: {
        [localidad: string]: {
            [key: string]: number
        }
    },
    serviceTypesTotal: {
        [key: string]: number
    }
    numberOfUnitsInvolved: number,
    numberOfUnitsByLocation:{ 
        [localidad: string]: number 
    }
}

export function getCount({ servicios, locations, serviceCodes, serviceTypes}: GetCountParams): Count {
    return ({ 
        serviceCodesByLocation: countServiceCodesByLocation(servicios, serviceCodes, locations),
        serviceCodesTotal: countServiceCodesTotal(servicios, serviceCodes),
        serviceTypesByLocation: countServiceTypesByLocation(servicios, serviceTypes, locations),
        serviceTypesTotal: countServiceTypesTotal(servicios, serviceTypes),
        numberOfUnitsInvolved: getTotalNumberOfUnitsInvolved(servicios),
        numberOfUnitsByLocation: getTotalNumberOfUnitsInvolvedByLocation(servicios, locations),
    })
} 