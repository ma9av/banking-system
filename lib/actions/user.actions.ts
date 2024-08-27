'use server'

import { cookies } from "next/headers"
import { createAdminClient, createSessionClient } from "../appwrite"
import {  ID, Query } from "node-appwrite"
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils"
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid"
import { plaidClient } from "../plaid"
import { revalidatePath } from "next/cache"
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions"

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
    try {
      const { database } = await createAdminClient();
  
      const user = await database.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_USER_COLLECTION_ID!,
        [Query.equal('userId', [userId])]
      )
  
      return parseStringify(user.documents[0]);
    } catch (error) {
      console.log(error)
    }
  }
export const signIn = async ({email, password}:signInProps) =>{
    try {
        const { account } = await createAdminClient()

        const session = await account.createEmailPasswordSession(email, password)

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
          });

        const user = await getUserInfo({ userId: session.userId})
        
        return parseStringify(user)
    } catch (error) {
        console.error('Error', error)
    }
}
export const signUp = async ({ password, ...userData}:SignUpParams) =>{
    
    let newUserAccount

    try {
        const { account, database } = await createAdminClient();

        newUserAccount = await account.create(ID.unique(), userData.email, password, `${userData.firstName} ${userData.lastName}`);

        if (!newUserAccount) throw new Error('Error creating new user account')

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: 'personal'
        })

        if (!dwollaCustomerUrl) throw new Error('Error creating dwolla customer')

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

        const newUser = await database.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        )

        const session = await account.createEmailPasswordSession(userData.email, password);
      
        cookies().set("appwrite-session", session.secret, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        });
        
        return parseStringify(newUser)
    } catch (error) {
        console.error('Error', error)
    }
}

export const logOut = async () =>{
    try {
        const { account } =await createSessionClient()
        cookies().delete('appwrite-session')

        await account.deleteSession('current')
        
    } catch (error) {
        return null;
    }
}

export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const result =  await account.get();
      const user = await  getUserInfo({ userId: result.$id})
      
      return parseStringify(user);

    } catch (error) {
      return null;
    }
  }

export const createLinkToken = async (user: User)=>{
    try {
        const tokenParams = {
            user:{
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[] ,
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate(tokenParams)
        return parseStringify({ linkToken: response.data.link_token})
    } catch (error) {
        
    }
}

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId}: createBankAccountProps) =>{

    try {
        const { database } = await createAdminClient()

        const bankAccount = await database.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId
            }
        )

        return parseStringify(bankAccount)

    } catch (error) {
        console.log(error)
    }
}

export const exchangePublicToken = async ({ publicToken, user}:exchangePublicTokenProps)=>{
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken
        })

        const accessToken = response.data.access_token
        const itemId = response.data.item_id

        const accountResponse = await plaidClient.accountsGet({
            access_token: accessToken
        })

        const accountData = accountResponse.data.accounts[0]

        const request:ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum
        }

        const processorTokenResponse = await plaidClient.processorTokenCreate(request)
        const processorToken = processorTokenResponse.data.processor_token

        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name
        })

        if (!fundingSourceUrl) throw Error

        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id)

        })

        revalidatePath("/")

        return parseStringify({
            publicTokenExchange: "complete"
        })

    } catch (error) {
        console.log(error)
    }

}
  export const getBanks = async ({ userId}: getBanksProps)=>{
    try {
        const { database } = await createAdminClient()

        const banks = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )

        return parseStringify(banks.documents)
    } catch (error) {
        
    }
  }
  export const getBank = async ({ documentId}: getBankProps)=>{
    try {
        const { database } = await createAdminClient()

        const banks = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_BANK_COLLECTION_ID!,
            [Query.equal('$id', [documentId])]
        )

        return parseStringify(banks.documents[0])
    } catch (error) {
        
    }
  }
  export const getBankByAccountId = async ({ accountId}: getBankByAccountIdProps)=>{
    try {
        const { database } = await createAdminClient()

        const banks = await database.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            process.env.APPWRITE_BANK_COLLECTION_ID!,
            [Query.equal('accountId', [accountId])]
        )
        if (banks.total !== 1) return null

        return parseStringify(banks.documents[0])
    } catch (error) {
        
    }
  }
