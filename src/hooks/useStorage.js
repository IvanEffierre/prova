import AsyncStorage from "@react-native-async-storage/async-storage";

const useStorage = () => {
const getItem = async(key) =>{
try{
    const password = await AsyncStorage.getItem(key);
    return JSON.parse(password) ||[];
}catch(error){
console.log("Errro ao buscar", error)
return[];
    }
}

const saveItem = async(key, value) =>{
   try{
    let passwords = await getItem(key);
    passwords.push(value)
    await AsyncStorage.setItem(key, JSON.stringify(passwords))
   }catch(error){
        console.log("Erro ao salvar", error)
    }

   }
    
    
}


export default useStorage;