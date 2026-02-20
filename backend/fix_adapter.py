with open('app/payments/izipay_adapter.py', 'r', encoding='utf-8') as f:
    content = f.read()

# El cancel_transaction debe pasar el cancel_request_id al header del cancel
old = '        jwt_token = await self._generate_cancel_token(transaction_id)'
new = '        jwt_token, cancel_request_id = await self._generate_cancel_token(transaction_id)'
content = content.replace(old, new)

# _generate_cancel_token debe retornar también el cancel_request_id
old = '                return token'
new = '                return token, cancel_request_id'
content = content.replace(old, new)

old = '                return None\n        except Exception as e:\n            logger.error(f"❌ IZIPAY Token generation exception: {str(e)}")\n            return None'
new = '                return None, None\n        except Exception as e:\n            logger.error(f"❌ IZIPAY Token generation exception: {str(e)}")\n            return None, None'
content = content.replace(old, new)

# if not jwt_token check
old = '        if not jwt_token:'
new = '        if not jwt_token or not cancel_request_id:'
content = content.replace(old, new)

# Usar cancel_request_id en el header del cancel request
old = '            "transactionId": transaction_id,'
new = '            "transactionId": cancel_request_id,'
content = content.replace(old, new)

print('Saved')
with open('app/payments/izipay_adapter.py', 'w', encoding='utf-8') as f:
    f.write(content)