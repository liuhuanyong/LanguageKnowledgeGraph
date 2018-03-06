# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render
import json
from django.http import JsonResponse
import re
import os
import pymongo
from django.views.decorators.csrf import csrf_exempt
from py2neo import Graph,Node,Relationship
graph=Graph("http://localhost:7474",user_name='neo4j',password='123456')

def kg_home(request):
    return render(request,"kg_home.html")

def show_kg_analysis(request):
    return render(request,"kg_analysis.html")

def show_kg_search(request):
    return render(request,"kg_search.html")

def neo4j_change_language(request):
    labelChinese_dict = {}
    relChinese_dict = {}
    propChinese_dict = {}
    chinese_english_dict = {}
    line_list = []
    for item in open("label_cn_en.txt"):
        item = item.strip()
        line_list.append(item)
    for line in list(set(line_list)):
        line = line.strip().split(';')
        if len(line) == 3:
            name_type = line[0]
            name_english = line[1]
            name_chinese = line[2]
            if name_type == "labelChinese":
                labelChinese_dict[name_english] = name_chinese
            elif name_type == "relChinese":
                relChinese_dict[name_english] = name_chinese
            elif name_type == "propChinese":
                propChinese_dict[name_english] = name_chinese
    chinese_english_dict['labelChinese'] = labelChinese_dict
    chinese_english_dict['relChinese'] = relChinese_dict
    chinese_english_dict['propChinese'] = propChinese_dict
    # print chinese_english_dict
    return JsonResponse(chinese_english_dict)


@csrf_exempt
def search_law_sentence(request):
    word=request.POST['word']
    query="match (o:law)<-[:part_of_law]-(m:law_sentence)-[:has_topic]->(n:topic) where n.name='%s'  return distinct m.name,o.name"%word
    data_list=[]
    for record in graph.run(query).data():
        data={}
        data['law_sentence']=record["o.name"]
        data['law_source']=record["m.name"]
        data_list.append(data)
    result_info={'data_list':data_list}
    return JsonResponse(result_info)
@csrf_exempt
def search_law_sentence_aspect(request):
    word = request.POST['word']
    aspect = request.POST['aspect']
    #word = "字母词"
    #aspect="语言规范"
    query = "match (o:law)<-[:part_of_law]-(m:law_sentence)-[:has_topic]->(n:topic), (m:law_sentence)-[:has_label]->(p:label) where n.name='%s' and p.name='%s'  return distinct m.name,o.name" % (word,aspect)
    data_list = []
    for record in graph.run(query).data():
        data = {}
        data['law_sentence'] = record["o.name"]
        data['law_source'] = record["m.name"]
        data_list.append(data)
    result_info = {'data_list': data_list}
    return JsonResponse(result_info)
def query_by_requirement(request):
    transfer_list_dic = request.GET
    # print type(transfer_list_dic)
    limit_num = transfer_list_dic['limit']
    transfer_list_str = transfer_list_dic['data']
    transfer_list = json.loads(transfer_list_str)
    info_tuple = generate_query(transfer_list, limit_num)
    query_sentence = info_tuple[0]
    couple_list = info_tuple[1]
    result = graph.run(query_sentence)
    return_list = []
    context = {'res': ''}
    for nodes in result:
        suitble_result = []
        for couple in couple_list:
            new_couple = ['', '', '']
            new_couple[0] = dict(nodes[couple[0][0]])
            new_couple[1] = dict(nodes[couple[1][0]])
            new_couple[2] = dict(nodes[couple[2][0]])
            suitble_result.append(new_couple)
        return_list.append(suitble_result)
        context = {'res': return_list}
    # print return_list
    # respose_text = serialize('json',return_list)
    # return HttpResponse(response_text,content_type='application/json')
    return JsonResponse(context)
    # handle the list from fore-end , return the neo4j query sentence and couple list
def generate_query(transfer_list, limit_num):
    return_list = []
    s = 'match '
    s1 = ' where '
    # print transfer_list
    for cl in transfer_list:
        if cl[0][0] not in return_list:
            return_list.append(cl[0][0])
        if cl[1][0] not in return_list:
            return_list.append(cl[1][0])
        if cl[2][0] not in return_list:
            return_list.append(cl[2][0])
        cl0_label = cl[0][0][:-1]
        cl1_relationship = cl[1][0][:-1]
        cl2_label = cl[2][0][:-1]
        couple_s = "(" + cl[0][0] + ":" + cl0_label + ")-[" + cl[1][0] + ":" + cl1_relationship + "]" + "->(" + cl[2][
            0] + ":" + cl2_label + ")"
        s = s + couple_s + ','
        for key, value in cl[0][1].items():
            if key == 'person_age':
                s1 = s1 + value[0] + '<' + cl[0][0] + '.person_age<' + value[1] + ' and '
            else:
                s1 = s1 + cl[0][0] + '.' + key + " CONTAINS '" + value + "' and "
        for key, value in cl[1][1].items():
            if key == 'person_age':
                print 'wait'
            else:
                s1 = s1 + cl[1][0] + '.' + key + " CONTAINS '" + value + "' and "
        for key, value in cl[2][1].items():
            if key == 'person_age':
                s1 = s1 + value[0] + '<' + cl[2][0] + '.person_age<' + value[1] + ' and '
            else:
                s1 = s1 + cl[2][0] + '.' + key + " CONTAINS '" + value + "' and "
    s = s[:-1]
    if s1 != ' where ':
        s1 = s1[:-5]
        whereStr = s1
    else:
        whereStr = ''
    ReturnStr = ','.join(return_list)
    query_sen = s + whereStr + ' return ' + ReturnStr + ' limit ' + limit_num
    # print query_sen
    return (query_sen, transfer_list)

def get_search_name(request):
    print "hello"
    search_name = request.GET['key']
    search_type = str(request.GET['limit'])
    # search_name='比亚迪'
    query = "match (n:%s) where n.name=~'.*%s.*' return n.name,ID(n) limit 20"% (search_type,search_name)
    print query
    result = graph.run(query)
    name_list_all = []
    for name in result.data():
        #  print name
        name_list = []
        name_list.append(name['n.name'])
        name_list.append(name['ID(n)'])
        name_list_all.append(name_list)
    context = {'res': name_list_all}
    # print context
    return JsonResponse(context)

def get_attributes_rel_name(request):
    search_name = request.GET['nodeid']
    # search_name='1685'
    query = "match (n) where ID(n)=%s return keys(n)" % search_name
    #   print query
    new_query = ""
    property_list = graph.run(query).data()[0]['keys(n)']
    for property in property_list:
        if property != 'name':
            new_query += ',n.%s as %s' % (property, property)
    query_property = "match (n) where ID(n)=%s return n.name as name %s" % (search_name, new_query)
    # print query_property
    properties = graph.run(query_property).data()[0]
    # print properties
    query_rel = "match (n)-[rel]->() where ID(n)=%s return rel.name" % search_name
    rel_list = []
    for rel_name in graph.run(query_rel).data():
    #    print rel_name
        rel_list.append(rel_name['rel.name'])
    rel_list = list(set(rel_list))
    res = {'prop': properties, 'rel': rel_list}
    #   print res
    return JsonResponse(res)

def get_info_relations(request):
    node_name = request.GET['nodeid']
    rel_name = request.GET['rel_name']
    # node_name='1685'
    # rel_name='采购'
    # print node_name,rel_name
    query_raw = "match (n)-[rel]->(m) where rel.name='%s' and ID(n)=%s return keys(rel),ID(rel),m.name,ID(m)" % (
        rel_name, node_name)
    # print query_raw
    # print graph.run(query_raw).data()[0]['keys(rel)']
    new_query = ''
    for rel_property in graph.run(query_raw).data()[0]['keys(rel)']:
        new_query += ',rel.%s as %s' % (rel_property, rel_property)
        # print new_query
    query_rel = "match (n)-[rel]->(m) where rel.name='%s' and ID(n)=%s return m.name as target_name,ID(rel),ID(m)%s" % (
        rel_name, node_name, new_query)
    result_list = graph.run(query_rel).data()
    # print result_list
    res_list = []
    print len(result_list)
    for result in result_list:
        res = {}
        rel_property = {}
        for key, value in result.items():
            if key not in ['target_name', 'ID(rel)', 'ID(m)']:
                rel_property[key] = value
        res['rel'] = rel_property
        res['target_name'] = result['target_name']
        res['target_id'] = result['ID(m)']
        res['rel_id'] = result['ID(rel)']
        res_list.append(res)

    print len(res_list)
    if len(res_list)<11:
        result = {'res': res_list}
    else:
        result = {'res': res_list[:10]}    

    # print result
    return JsonResponse(result)

# click node or relationship in graph, show the properties
def show_propterty(request):
    edit_dic = request.GET
    edit_type = edit_dic['type']
    edit_str = edit_dic['searchStr']
    if edit_type == 'entity':
        if edit_str == 'Company':
            query = "MATCH (a:Company) WHERE a.company_code = '000002' RETURN keys(a) limit 1"
        else:
            query = 'MATCH (a:' + edit_str + ') RETURN keys(a) limit 1'
    else:
        query = 'MATCH a -[r:' + edit_str + ']-> b RETURN keys(r) limit 1'
    result = graph.run(query)
    propterties = []
    for item in result:
        propterties = item[0]
    context = {'propterties': propterties}
    return JsonResponse(context)
