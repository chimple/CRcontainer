package org.curiouslearning.container;

import com.rusticisoftware.tincan.*;
import com.rusticisoftware.tincan.lrsresponses.*;
import com.rusticisoftware.tincan.v10x.StatementsQuery;
import com.rusticisoftware.tincan.lrsresponses.StatementsResultLRSResponse;
import android.util.Log;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import android.content.SharedPreferences;


public class XAPIManager {
    private static final String TAG = "XAPIManager";
    // LRS details
    private static final String LRS_ENDPOINT = "https://curious-reader.lrs.io/xapi/";
    private static final String LRS_USERNAME = "chimp";
    private static final String LRS_PASSWORD = "chimpoo";

    private RemoteLRS lrs;
    private SharedPreferences prefs;
    private static final String SHARED_PREFS_NAME = "appCached";

    public XAPIManager(android.content.Context applicationContext) {
        try{
            //need applicationContext to access getSharedPreferences() method
            prefs = applicationContext.getSharedPreferences(SHARED_PREFS_NAME, android.content.Context.MODE_PRIVATE);
            String selectedLanguage = prefs.getString("selectedLanguage", "");
        }catch(Exception e){
            Log.e(TAG, "Error in retrieving selectedLanguage in XAPIManager: " + e.getMessage());
        }

        try {
            lrs = new RemoteLRS();
            lrs.setEndpoint(LRS_ENDPOINT);
            lrs.setVersion(TCAPIVersion.V100);  // Set xAPI version explicitly
            lrs.setUsername(LRS_USERNAME);
            lrs.setPassword(LRS_PASSWORD);

        } catch (Exception e) {
            Log.e(TAG, " Error initializing LRS: " + e.getMessage());
        }
    }

    /**
     * Send xAPI Statement
     */
    public void sendXAPIStatement(
            String userEmail,
            String userName,
            String verbId,
            String verbDisplay,
            String activityId,
            String activityName,
            String lessonId,
            String courseId,
            String classId,
            String schoolId,
            String assignmentId,
            String chapterId,
            int score,
            int correctMoves,
            int wrongMoves

    )
    {
        try {
            boolean doesExist = doesStatementExist(userEmail, activityId);
            if (doesExist) {
                Log.d(TAG, "Statement already exists for this user, activityId and language.");
                return; // Skip sending
            }

            String selectedLanguage = prefs.getString("selectedLanguage", "");

            // Create Actor
            Agent actor = new Agent();
            actor.setMbox("mailto:" + userEmail);
            actor.setName(userName);

            // Create Verb
            Verb verb = new Verb(verbId);
            verb.setDisplay(new LanguageMap());
            verb.getDisplay().put(selectedLanguage, verbDisplay);

            // Create Activity
            Activity activity = new Activity(activityId);
            activity.setDefinition(new ActivityDefinition());
            activity.getDefinition().setName(new LanguageMap());
            activity.getDefinition().getName().put(selectedLanguage, activityName);

            // Create Result
            Result result = new Result();
            Score scoreObj = new Score();
            scoreObj.setRaw((double)score);
            result.setScore(scoreObj);
            result.setSuccess(score > 35);
            result.setCompletion(verbDisplay == "completed");
            result.setResponse("Correct: " + correctMoves + ", Wrong: " + wrongMoves);

            // Create Context
            Context context = new Context();
            ContextActivities contextActivities = new ContextActivities();

            List<Activity> groupingActivities = new ArrayList<>();

            // Add each grouping activity directly
            groupingActivities.add(new Activity("http://example.com/course/" + courseId));
            groupingActivities.add(new Activity("http://example.com/class/" + classId));
            groupingActivities.add(new Activity("http://example.com/math-lesson-1/" + lessonId));
            groupingActivities.add(new Activity("http://example.com/school/" + schoolId));
            groupingActivities.add(new Activity("http://example.com/assignment/" + assignmentId));
            groupingActivities.add(new Activity("http://example.com/chapter/" + chapterId));

            contextActivities.setGrouping(groupingActivities);
            context.setContextActivities(contextActivities);

            Statement statement = new Statement();
            statement.setActor(actor);
            statement.setVerb(verb);
            statement.setObject(activity);
            statement.setResult(result);
            statement.setContext(context);

            // Send Statement
            StatementLRSResponse response = lrs.saveStatement(statement);

            if (response.getSuccess()) {
                Log.d(TAG, "statement success data : " + statement);
                Log.d(TAG, "xAPI Statement sent successfully!");
            } else {
                Log.d(TAG, "statement failure data : " + statement);
                Log.e(TAG, "Failed to send xAPI Statement: " + response.getErrMsg());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sending xAPI statement: " + e.getMessage());
        }
    }

    private boolean doesStatementExist(String userEmail, String activityId) {
        try {
            String selectedLanguage = prefs.getString("selectedLanguage", "");

            List<Map<String, Object>> statements = retrieveXAPIStatements(userEmail);

            for (Map<String, Object> statement : statements) {
                Map<String, Object> object = (Map<String, Object>) statement.get("object");
                if (object == null) {
                    continue;
                }

                String objectId = null;
                Object idObj = object.get("id");
                if (idObj instanceof String) {
                    objectId = (String) idObj;
                } else if (idObj != null) {
                    objectId = idObj.toString();
                }

                String extractedId = null;
                if (objectId != null && objectId.contains("activities:")) {
                    String[] parts = objectId.split("activities:");
                    if (parts.length > 1) {
                        extractedId = parts[1].trim();
                    }
                }

                if (activityId.equals(extractedId)) {
                    return true;
                }

            }
        } catch (Exception e) {
            Log.e(TAG, "Error in doesStatementExist: " + e.getMessage(), e);
        }

        return false;
    }


    /**
     * Retrieve xAPI Statements
     */
    public List<Map<String, Object>> retrieveXAPIStatements(String agentEmail) {
        List<Map<String, Object>> parsedStatements = new ArrayList<>();
        try {
            String selectedLanguage = prefs.getString("selectedLanguage", "");
            // Create query with agent filter
            StatementsQuery query = new StatementsQuery();
            Agent agent = new Agent();
            agent.setMbox("mailto:" + agentEmail);
            query.setAgent(agent);
            query.setLimit(100);

            // Execute query
            StatementsResultLRSResponse response = lrs.queryStatements(query);

            if (response.getSuccess() && response.getContent() != null) {
                List<Statement> statements = response.getContent().getStatements();

                if (statements != null && !statements.isEmpty()) {
                    for (Statement statement : statements) {
                        try {
                            //filter the statements through language first
                            if (!(statement.getObject() instanceof Activity)) {
                                continue; // skip if not Activity type object
                            }

                            Activity activity = (Activity) statement.getObject();
                            ActivityDefinition definition = activity.getDefinition();

                            if (definition == null) {
                                continue; // skip if no definition
                            }
                            Object nameObj = definition.getName();
                            if (!(nameObj instanceof LanguageMap)) {
                                continue; // skip if name is not LanguageMap
                            }
                            LanguageMap nameMap = (LanguageMap) nameObj;
                            if (!nameMap.containsKey(selectedLanguage)) {
                                continue; // skip if language doesn't match
                            }

                            // Parse statement data
                            Map<String, Object> parsedStatement = new LinkedHashMap<>();

                            // Basic statement info
                            parsedStatement.put("id", statement.getId());

                            // Actor info
                            if (statement.getActor() instanceof Agent) {
                                Agent statementAgent = (Agent) statement.getActor();
                                Map<String, Object> actorMap = new HashMap<>();
                                actorMap.put("mbox", statementAgent.getMbox());
                                actorMap.put("name", statementAgent.getName());
                                parsedStatement.put("actor", actorMap);
                            }

                            // Verb info
                            Verb verb = statement.getVerb();
                            if (verb != null) {
                                Map<String, Object> verbMap = new HashMap<>();
                                verbMap.put("id", verb.getId());
                                verbMap.put("display", verb.getDisplay());
                                parsedStatement.put("verb", verbMap);
                            }

                            // Object/Activity info
                            if (statement.getObject() instanceof Activity) {
                                Map<String, Object> activityMap = new HashMap<>();
                                activityMap.put("id", activity.getId());

                                if (definition != null) {
                                    Map<String, Object> definitionMap = new HashMap<>();
                                    definitionMap.put("name", definition.getName());

                                    // Activity extensions
                                    if (definition.getExtensions() != null) {
                                        definitionMap.put("courseId",
                                                definition.getExtensions().get("http://example.com/xapi/courseId"));
                                        definitionMap.put("lessonId",
                                                definition.getExtensions().get("http://example.com/xapi/lessonId"));
                                    }

                                    activityMap.put("definition", definitionMap);
                                }

                                parsedStatement.put("object", activityMap);
                            }

                            // Result info
                            Result result = statement.getResult();
                            if (result != null) {
                                Map<String, Object> resultMap = new HashMap<>();

                                // Score
                                Score score = result.getScore();
                                if (score != null) {
                                    Map<String, Object> scoreMap = new HashMap<>();
                                    scoreMap.put("raw", score.getRaw());
                                    resultMap.put("score", scoreMap);
                                }

                                // Basic result fields
                                resultMap.put("success", result.getSuccess());
                                resultMap.put("completion", result.getCompletion());
                                resultMap.put("response", result.getResponse());
                                resultMap.put("duration", result.getDuration());

                                // Result extensions
                                if (result.getExtensions() != null) {
                                    resultMap.put("correctMoves",
                                            result.getExtensions().get("http://example.com/xapi/correctMoves"));
                                    resultMap.put("wrongMoves",
                                            result.getExtensions().get("http://example.com/xapi/wrongMoves"));
                                    resultMap.put("assignmentId",
                                            result.getExtensions().get("http://example.com/xapi/assignmentId"));
                                }

                                parsedStatement.put("result", resultMap);
                            }

                            // Context info
                            Context context = statement.getContext();
                            if (context != null) {
                                Map<String, Object> contextMap = new HashMap<>();

                                // Context extensions
                                if (context.getExtensions() != null) {
                                    contextMap.put("studentId",
                                            context.getExtensions().get("http://example.com/xapi/studentId"));
                                    contextMap.put("chapterId",
                                            context.getExtensions().get("http://example.com/xapi/chapterId"));
                                    contextMap.put("lessonId",
                                            context.getExtensions().get("http://example.com/xapi/lessonId"));
                                    contextMap.put("schoolId",
                                            context.getExtensions().get("http://example.com/xapi/schoolId"));
                                    contextMap.put("isDeleted",
                                            context.getExtensions().get("http://example.com/xapi/isDeleted"));
                                    contextMap.put("createdAt",
                                            context.getExtensions().get("http://example.com/xapi/createdAt"));
                                    contextMap.put("updatedAt",
                                            context.getExtensions().get("http://example.com/xapi/updatedAt"));
                                }

                                parsedStatement.put("context", contextMap);
                            }

                            // Timestamp
                            parsedStatement.put("timestamp", statement.getTimestamp());

                            // Add to list
                            parsedStatements.add(parsedStatement);

                            // Log successful parsing
                            Log.d(TAG, "Successfully processed statement: " + parsedStatement);

                        } catch (Exception parseError) {
                            Log.e(TAG, "Error parsing individual statement: " +
                                    (parseError.getMessage() != null ? parseError.getMessage() : "Unknown parse error"));
                        }
                    }
                } else {
                    Log.w(TAG, "No statements found for agent: " + agentEmail);
                }
            } else {
                String errorMsg = response.getErrMsg() != null ?
                        response.getErrMsg() : "Unknown query error";
                Log.e(TAG, "Query failed: " + errorMsg);
            }
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown exception";
            Log.e(TAG, "Error retrieving statements: " + errorMsg);
        }
        
        return parsedStatements;
    }
}
