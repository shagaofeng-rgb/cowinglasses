"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { customerLoyaltyLedgers, customerTagAssignments } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";
export type DetailState={success:boolean;message:string};export const initialDetailState:DetailState={success:false,message:""};
const adjustment=z.object({customerId:z.string().uuid(),pointsDelta:z.coerce.number().int().min(-100000).max(100000),balanceDelta:z.string().regex(/^-?\d+(\.\d{1,2})?$/),reason:z.string().trim().min(2).max(120)});
export async function adjustLoyaltyAction(_s:DetailState,fd:FormData):Promise<DetailState>{const actor=await requirePermission("customers.update");const p=adjustment.safeParse(Object.fromEntries(fd));if(!p.success)return{success:false,message:p.error.issues[0]?.message??"请填写调整信息。"};try{await getDatabase().transaction(async(tx)=>{await tx.insert(customerLoyaltyLedgers).values({...p.data,referenceType:"admin_adjustment"});});await writeAuditLog({actorId:actor.id,action:"customers.loyalty.adjust",resourceType:"customer",resourceId:p.data.customerId,result:"success",metadata:{pointsDelta:p.data.pointsDelta,balanceDelta:p.data.balanceDelta}});revalidatePath(`/admin/customers/${p.data.customerId}`);return{success:true,message:"积分/余额调整已记入流水。"}}catch(e){console.error(e);return{success:false,message:"调整失败，请重试。"}}}
export async function setCustomerTagsAction(customerId:string,tagIds:string[]){const actor=await requirePermission("customers.update");if(!z.string().uuid().safeParse(customerId).success)return;await getDatabase().transaction(async(tx)=>{await tx.delete(customerTagAssignments).where(eq(customerTagAssignments.customerId,customerId));if(tagIds.length)await tx.insert(customerTagAssignments).values(tagIds.filter(id=>z.string().uuid().safeParse(id).success).map(tagId=>({customerId,tagId})));});await writeAuditLog({actorId:actor.id,action:"customers.tags.set",resourceType:"customer",resourceId:customerId,result:"success",metadata:{tagIds}});revalidatePath(`/admin/customers/${customerId}`)}
